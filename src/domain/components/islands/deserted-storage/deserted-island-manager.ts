import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EquipmentReader } from 'src/domain/components/equipments/equipment-reader';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { DesertedIslandStorageWriter } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-writer';
import { IslandManager } from 'src/domain/components/islands/interface/island-manager';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player, PlayerWithEquippedItems } from 'src/domain/models/game/player';
import { ISLAND_LOCK_KEY } from 'src/infrastructure/redis/key';
import { RedisTransactionManager } from 'src/infrastructure/redis/redis-transaction-manager';

@Injectable()
export class DesertedIslandManager implements IslandManager {
    private readonly logger = new Logger(DesertedIslandManager.name);

    constructor(
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly desertedIslandStorageWriter: DesertedIslandStorageWriter,
        private readonly playerStorageReader: PlayerStorageReader,
        private readonly playerStorageWriter: PlayerStorageWriter,
        private readonly islandWriter: IslandWriter,
        private readonly equipmentReader: EquipmentReader,

        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly lockManager: RedisTransactionManager,
    ) {}

    async canJoin(islandId: string) {
        const island = await this.desertedIslandStorageReader.readOne(islandId);

        const countParticipants =
            await this.desertedIslandStorageReader.countPlayer(islandId);
        if (island.max <= countParticipants) {
            throw new DomainException(
                DomainExceptionType.ISLAND_FULL,
                HttpStatus.UNPROCESSABLE_ENTITY,
                ISLAND_FULL,
            );
        }
    }

    async join(player: Player) {
        const { id: playerId, roomId: islandId } = player;

        const key = ISLAND_LOCK_KEY(islandId);
        await this.lockManager.transaction(key, [
            {
                execute: () => this.canJoin(islandId),
            },
            {
                execute: () => this.playerStorageWriter.create(player),
                rollback: () => this.playerStorageWriter.remove(playerId),
            },
            {
                execute: () =>
                    this.desertedIslandStorageWriter.addPlayer(
                        islandId,
                        playerId,
                    ),
            },
        ]);
    }

    async getActiveUsers(
        islandId: string,
        myPlayerId: string,
    ): Promise<PlayerWithEquippedItems[]> {
        const island = await this.desertedIslandStorageReader.readOne(islandId);

        const playerIds = [...island.players].filter((id) => id !== myPlayerId);
        const players = await this.playerStorageReader.readMany(playerIds);

        const equipmentMap =
            await this.equipmentReader.readEquipmentStates(playerIds);

        return players.map((player) =>
            Object.assign(player, {
                equipmentState: equipmentMap[player.id],
            }),
        );
    }

    async left(islandId: string, playerId: string) {
        await this.desertedIslandStorageWriter.removePlayer(islandId, playerId);
        await this.playerStorageWriter.remove(playerId);
    }

    async handleLeave(player: Player) {
        const { id: playerId, roomId: islandId } = player;

        const key = ISLAND_LOCK_KEY(islandId);

        await this.lockManager.transaction(key, [
            {
                execute: () =>
                    this.desertedIslandStorageWriter.removePlayer(
                        islandId,
                        playerId,
                    ),
                rollback: () =>
                    this.desertedIslandStorageWriter.addPlayer(
                        islandId,
                        playerId,
                    ),
            },
            {
                execute: () => this.playerStorageWriter.remove(playerId),
                rollback: () => this.playerStorageWriter.create(player),
            },
            {
                execute: () => this.removeEmpty(islandId),
            },
        ]);

        try {
            await this.islandJoinWriter.left(islandId, player.id);
        } catch (e) {
            this.logger.error(
                `섬 참여 데이터 삭제 실패: ${islandId}, playerId: ${player.id}`,
                e,
            );
        }

        return { player };
    }

    async removeEmpty(islandId: string): Promise<void> {
        const playerCount =
            await this.desertedIslandStorageReader.countPlayer(islandId);

        if (playerCount < 1) {
            await this.desertedIslandStorageWriter.remove(islandId);
            try {
                await this.islandWriter.remove(islandId);
            } catch (e) {
                this.logger.error(`빈 섬 제거 실패: ${islandId}`, e);
            }
        }
    }
}

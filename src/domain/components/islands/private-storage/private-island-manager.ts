import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EquipmentReader } from 'src/domain/components/equipments/equipment-reader';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { RespawnQueueManager } from 'src/domain/components/island-spawn-object/respawn-queue-manager';
import { IslandManager } from 'src/domain/components/islands/interface/island-manager';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { LivePrivateIslandReader } from 'src/domain/components/islands/live-private-island-reader';
import { LivePrivateIslandWriter } from 'src/domain/components/islands/live-private-island-writer';
import { PrivateIslandPasswordChecker } from 'src/domain/components/islands/private-storage/private-island-password-checker';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player, PlayerWithEquippedItems } from 'src/domain/models/game/player';
import { ISLAND_LOCK_KEY } from 'src/infrastructure/redis/key';
import { RedisTransactionManager } from 'src/infrastructure/redis/redis-transaction-manager';
import { Logger } from 'winston';

@Injectable()
export class PrivateIslandManager implements IslandManager {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly livePrivateIslandReader: LivePrivateIslandReader,
        private readonly livePrivateIslandWriter: LivePrivateIslandWriter,
        private readonly playerStorageWriter: PlayerStorageWriter,
        private readonly playerStorageReader: PlayerStorageReader,
        private readonly equipmentReader: EquipmentReader,
        private readonly islandActiveObjectWriter: IslandActiveObjectWriter,
        private readonly islandWriter: IslandWriter,
        private readonly respawnQueueManager: RespawnQueueManager,
        private readonly privateIslandPasswordChecker: PrivateIslandPasswordChecker,
        private readonly lockManager: RedisTransactionManager,
    ) {}

    async canJoin(islandId: string): Promise<boolean> {
        const island = await this.livePrivateIslandReader.readOne(islandId);
        return island.players.size < island.max;
    }

    async join(player: Player, password: string): Promise<void> {
        const { id: playerId, roomId: islandId } = player;

        await this.privateIslandPasswordChecker.checkPassword(
            islandId,
            password,
        );

        const key = ISLAND_LOCK_KEY(islandId);
        await this.lockManager.transaction(key, [
            {
                execute: async () => {
                    const canJoin = await this.canJoin(islandId);
                    if (!canJoin) {
                        throw new DomainException(
                            DomainExceptionType.ISLAND_FULL,
                            HttpStatus.UNPROCESSABLE_ENTITY,
                            ISLAND_FULL,
                        );
                    }
                },
            },
            {
                execute: () => this.playerStorageWriter.create(player),
                rollback: () => this.playerStorageWriter.remove(playerId),
            },
            {
                execute: () =>
                    this.livePrivateIslandWriter.addPlayer(islandId, playerId),
            },
        ]);
    }

    async getActiveUsers(
        islandId: string,
        myPlayerId: string,
    ): Promise<PlayerWithEquippedItems[]> {
        const island = await this.livePrivateIslandReader.readOne(islandId);
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

    async left(islandId: string, playerId: string): Promise<void> {
        await this.livePrivateIslandWriter.removePlayer(islandId, playerId);
        await this.playerStorageWriter.remove(playerId);
    }

    async handleLeave(
        player: Player,
    ): Promise<{ player: Player; ownerChanged?: boolean }> {
        const { id: playerId, roomId: islandId } = player;
        const key = ISLAND_LOCK_KEY(islandId);
        await this.lockManager.transaction(key, [
            {
                execute: () =>
                    this.livePrivateIslandWriter.removePlayer(
                        islandId,
                        playerId,
                    ),
                rollback: () =>
                    this.livePrivateIslandWriter.addPlayer(islandId, playerId),
            },
            {
                execute: () => this.playerStorageWriter.remove(playerId),
                rollback: () => this.playerStorageWriter.create(player),
            },
            {
                execute: () => this.removeEmpty(islandId),
            },
        ]);

        return { player };
    }

    async removeEmpty(islandId: string): Promise<void> {
        const playerCount =
            await this.livePrivateIslandReader.countPlayer(islandId);

        if (playerCount < 1) {
            try {
                await this.livePrivateIslandWriter.remove(islandId);
            } catch (e) {
                this.logger.error(`메모리/Redis 섬 제거 실패: ${islandId}`, e);
            }

            try {
                this.islandActiveObjectWriter.deleteAllByIslandId(islandId);
            } catch (e) {
                this.logger.error(`ActiveObject 제거 실패: ${islandId}`, e);
            }

            try {
                this.respawnQueueManager.removeAllByIslandId(islandId);
            } catch (e) {
                this.logger.error(
                    `RespawnQueue 스폰 대기열 오브젝트 제거 실패: ${islandId}`,
                    e,
                );
            }

            try {
                await this.islandWriter.remove(islandId);
            } catch (e) {
                this.logger.error(`DB 섬 제거 실패: ${islandId}`, e);
            }
        }
    }
}

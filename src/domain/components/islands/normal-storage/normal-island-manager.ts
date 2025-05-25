import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IslandManager } from 'src/domain/components/islands/interface/island-manager';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { NormalIslandStorageWriter } from 'src/domain/components/islands/normal-storage/normal-island-storage-writer';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player } from 'src/domain/models/game/player';

@Injectable()
export class NormalIslandManager implements IslandManager {
    private readonly logger = new Logger(NormalIslandManager.name);

    constructor(
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly normalIslandStorageWriter: NormalIslandStorageWriter,
        private readonly playerStorageReader: PlayerStorageReader,
        private readonly playerStorageWriter: PlayerStorageWriter,
        private readonly islandWriter: IslandWriter,
    ) {}

    async canJoin(islandId: string) {
        const island = await this.normalIslandStorageReader.readOne(islandId);

        const countParticipants =
            await this.normalIslandStorageReader.countPlayer(islandId);
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

        await this.playerStorageWriter.create(player);
        await this.normalIslandStorageWriter.addPlayer(islandId, playerId);
    }

    async getActiveUsers(islandId: string, myPlayerId: string) {
        const island = await this.normalIslandStorageReader.readOne(islandId);

        const activeUsers: Player[] = [];

        for (const playerId of island.players) {
            const player = await this.playerStorageReader.readOne(playerId);
            if (player) {
                activeUsers.push(player);
            }
        }

        return activeUsers.filter((player) => player.id !== myPlayerId);
    }

    async left(islandId: string, playerId: string) {
        await this.normalIslandStorageWriter.removePlayer(islandId, playerId);
        await this.playerStorageWriter.remove(playerId);
    }

    async removeEmpty(islandId: string): Promise<void> {
        const playerCount =
            await this.normalIslandStorageReader.countPlayer(islandId);

        if (playerCount < 1) {
            await this.normalIslandStorageWriter.remove(islandId);

            try {
                await this.islandWriter.remove(islandId);
            } catch (e) {
                this.logger.error(`빈 섬 제거 실패: ${islandId}`, e);
            }
        }
    }
}

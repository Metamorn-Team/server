import { Injectable } from '@nestjs/common';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { IslandManager } from 'src/domain/components/islands/interface/island-manager';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { NormalIslandStorageWriter } from 'src/domain/components/islands/normal-storage/normal-island-storage-writer';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player } from 'src/domain/models/game/player';
import { v4 } from 'uuid';

@Injectable()
export class NormalIslandManager implements IslandManager {
    constructor(
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly normalIslandStorageWriter: NormalIslandStorageWriter,
        private readonly playerStorageReader: PlayerStorageReader,
        private readonly playerStorageWriter: PlayerStorageWriter,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly islandWriter: IslandWriter,
    ) {}

    async canJoin(islandId: string) {
        const island = await this.normalIslandStorageReader.readOne(islandId);

        const countParticipants =
            await this.normalIslandStorageReader.countPlayer(islandId);
        if (island.max <= countParticipants) {
            // 임시 예외 코드
            throw new DomainException(
                DomainExceptionType.ISLAND_FULL,
                1000,
                ISLAND_FULL,
            );
        }
    }

    async join(player: Player) {
        const { id: playerId, roomId: islandId } = player;

        await this.playerStorageWriter.create(player);
        await this.normalIslandStorageWriter.addPlayer(islandId, playerId);

        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: playerId },
            v4,
        );
        await this.islandJoinWriter.create(islandJoin);
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
        await this.islandJoinWriter.left(islandId, playerId);
    }

    async removeEmpty(islandId: string): Promise<void> {
        const playerCount =
            await this.normalIslandStorageReader.countPlayer(islandId);

        if (playerCount < 1) {
            await this.normalIslandStorageWriter.remove(islandId);
            await this.islandWriter.remove(islandId);
        }
    }
}

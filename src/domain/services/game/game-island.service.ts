import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { DESERTED_MAX_MEMBERS } from 'src/common/constants';
import { IslandReader } from 'src/domain/components/islands/island-reader';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { UserReader } from 'src/domain/components/users/user-reader';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player } from 'src/domain/models/game/player';
import { JoinedIslandInfo, SocketClientId } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { DesertedIslandStorageWriter } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-writer';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { IslandManagerFactory } from 'src/domain/components/islands/factory/island-manager-factory';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { RedisTransactionManager } from 'src/infrastructure/redis/redis-transaction-manager';
import { ISLAND_LOCK_KEY } from 'src/infrastructure/redis/key';

@Injectable()
export class GameIslandService {
    constructor(
        private readonly islandWriter: IslandWriter,
        private readonly islandReader: IslandReader,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly userReader: UserReader,

        private readonly playerStorageReader: PlayerStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly desertedIslandStorageWriter: DesertedIslandStorageWriter,

        private readonly islandManagerFactory: IslandManagerFactory,
        private readonly lockManager: RedisTransactionManager,
    ) {}

    async getAvailableDesertedIsland() {
        const islands = await this.desertedIslandStorageReader.readAll();

        if (islands.length === 0) {
            return await this.createIsland();
        }

        const joinableIslands = islands.filter(
            (island) => island.players.size < island.max,
        );

        return joinableIslands[
            Math.floor(Math.random() * joinableIslands.length)
        ];
    }

    async createIsland() {
        const islandEntity = IslandEntity.create(
            {
                type: IslandTypeEnum.DESERTED,
                maxMembers: DESERTED_MAX_MEMBERS,
            },
            v4,
        );
        await this.islandWriter.create(islandEntity);

        return this.createLiveIsland(islandEntity.id);
    }

    getIsland(islandId: string) {
        return this.desertedIslandStorageReader.readOne(islandId);
    }

    async joinNormalIsland(
        playerId: string,
        clientId: string,
        islandId: string,
        x: number,
        y: number,
    ): Promise<JoinedIslandInfo> {
        const user = await this.userReader.readProfile(playerId);
        const island = await this.islandReader.readOne(islandId);
        const manager = this.islandManagerFactory.get(IslandTypeEnum.NORMAL);

        const player = Player.create({
            id: user.id,
            avatarKey: user.avatarKey,
            clientId,
            nickname: user.nickname,
            roomId: islandId,
            islandType: island.type,
            tag: user.tag,
            x,
            y,
        });

        const key = ISLAND_LOCK_KEY(islandId);
        await this.lockManager.transaction(key, [
            {
                execute: () => manager.canJoin(islandId),
            },
            {
                execute: () => manager.join(player),
                rollback: () => manager.left(islandId, playerId),
            },
        ]);

        const activePlayers = await manager.getActiveUsers(islandId, playerId);

        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: playerId },
            v4,
        );
        await this.islandJoinWriter.create(islandJoin);

        return {
            activePlayers,
            joinedIslandId: island.id,
            joinedPlayer: player,
        };
    }

    async joinDesertedIsland(
        playerId: string,
        clientId: string,
        x: number,
        y: number,
    ) {
        const user = await this.userReader.readProfile(playerId);
        const manager = this.islandManagerFactory.get(IslandTypeEnum.DESERTED);

        const joinableIsland = await this.getAvailableDesertedIsland();

        const { id: islandId, type } = joinableIsland;
        const player = Player.create({
            id: user.id,
            clientId,
            nickname: user.nickname,
            avatarKey: user.avatarKey,
            islandType: type,
            tag: user.tag,
            roomId: islandId,
            x,
            y,
        });

        const key = ISLAND_LOCK_KEY(islandId);
        await this.lockManager.transaction(key, [
            {
                execute: () => manager.canJoin(islandId),
            },
            {
                execute: () => manager.join(player),
                rollback: () => manager.left(islandId, playerId),
            },
        ]);

        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: playerId },
            v4,
        );
        await this.islandJoinWriter.create(islandJoin);

        const activePlayers = await manager.getActiveUsers(islandId, playerId);

        return {
            activePlayers,
            joinedIslandId: islandId,
            joinedPlayer: player,
        };
    }

    async createLiveIsland(islandId: string) {
        const island = {
            id: islandId,
            max: DESERTED_MAX_MEMBERS,
            players: new Set<SocketClientId>(),
            type: IslandTypeEnum.DESERTED,
        };
        await this.desertedIslandStorageWriter.create(island);

        return island;
    }

    async leftPlayer(playerId: string) {
        const player = await this.playerStorageReader.readOne(playerId);

        const { roomId: islandId, islandType } = player;
        const manager = this.islandManagerFactory.get(islandType);

        const key = ISLAND_LOCK_KEY(islandId);
        await this.lockManager.transaction(key, [
            {
                execute: () => manager.left(islandId, playerId),
                rollback: () => manager.join(player),
            },
            {
                execute: () => manager.removeEmpty(islandId),
                rollback: () => this.createLiveIsland(islandId),
            },
        ]);
        await this.islandJoinWriter.left(islandId, playerId);

        return player;
    }

    async kickPlayerById(playerId: string) {
        try {
            const player = await this.playerStorageReader.readOne(playerId);
            const { roomId: islandId, islandType } = player;

            const manager = this.islandManagerFactory.get(islandType);
            await manager.left(islandId, playerId);

            return player;
        } catch (e) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE
            ) {
                return;
            }
            throw e;
        }
    }

    async checkCanJoin(islandId: string): Promise<{
        islandId?: string;
        canJoin: boolean;
        reason?: string;
    }> {
        try {
            await this.islandManagerFactory
                .get(IslandTypeEnum.NORMAL)
                .canJoin(islandId);

            return { islandId, canJoin: true };
        } catch (e: unknown) {
            if (e instanceof DomainException) {
                if (e.errorType === DomainExceptionType.ISLAND_FULL) {
                    return {
                        canJoin: false,
                        reason: ISLAND_FULL,
                    };
                }
                if (e.errorType === DomainExceptionType.ISLAND_NOT_FOUND) {
                    return {
                        canJoin: false,
                        reason: ISLAND_NOT_FOUND_MESSAGE,
                    };
                }
            }
            throw e;
        }
    }
}

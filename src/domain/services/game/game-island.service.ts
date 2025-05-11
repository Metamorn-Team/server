import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { UNINHABITED_MAX_MEMBERS } from 'src/common/constants';
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

@Injectable()
export class GameIslandService {
    constructor(
        private readonly islandWriter: IslandWriter,
        private readonly islandReader: IslandReader,
        private readonly userReader: UserReader,

        private readonly playerStorageReader: PlayerStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly desertedIslandStorageWriter: DesertedIslandStorageWriter,

        private readonly islandManagerFactory: IslandManagerFactory,
    ) {}

    async getAvailableDesertedIsland() {
        const islands = await this.desertedIslandStorageReader.readAll();
        if (islands.length !== 0) {
            for (const island of islands) {
                if (island && island.players.size < island.max) {
                    return island;
                }
            }
        }

        return await this.createIsland();
    }

    async createIsland() {
        const islandEntity = IslandEntity.create(
            {
                type: IslandTypeEnum.DESERTED,
                maxMembers: UNINHABITED_MAX_MEMBERS,
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
        // const now = new Date().toISOString();
        // console.log(`[${now}] joinNormalIsland called for player ${playerId}`);
        const user = await this.userReader.readProfile(playerId);
        const island = await this.islandReader.readOne(islandId);
        const manager = this.islandManagerFactory.get(IslandTypeEnum.NORMAL);

        await manager.canJoin(islandId);
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

        await manager.join(player);
        const activePlayers = await manager.getActiveUsers(islandId, playerId);

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
        const availableIsland = await this.getAvailableDesertedIsland();
        const manager = this.islandManagerFactory.get(IslandTypeEnum.DESERTED);

        const { id: islandId } = availableIsland;
        const player = Player.create({
            id: user.id,
            clientId,
            nickname: user.nickname,
            avatarKey: user.avatarKey,
            islandType: availableIsland.type,
            tag: user.tag,
            roomId: islandId,
            x,
            y,
        });

        await manager.join(player);
        const activePlayers = await manager.getActiveUsers(islandId, playerId);

        return {
            activePlayers,
            joinedIslandId: availableIsland.id,
            joinedPlayer: player,
        };
    }

    async createLiveIsland(islandId: string) {
        const island = {
            id: islandId,
            max: UNINHABITED_MAX_MEMBERS,
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

        await manager.left(islandId, playerId);
        await manager.removeEmpty(islandId);

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

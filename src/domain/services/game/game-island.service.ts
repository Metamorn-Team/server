import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { UNINHABITED_MAX_MEMBERS } from 'src/common/constants';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { IslandReader } from 'src/domain/components/islands/island-reader';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { UserReader } from 'src/domain/components/users/user-reader';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Player } from 'src/domain/models/game/player';
import { JoinedIslandInfo, SocketClientId } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { NormalIslandStorageWriter } from 'src/domain/components/islands/normal-storage/normal-island-storage-writer';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { DesertedIslandStorageWriter } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-writer';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';

@Injectable()
export class GameIslandService {
    constructor(
        private readonly islandWriter: IslandWriter,
        private readonly islandReader: IslandReader,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly userReader: UserReader,

        private readonly playerStorageReader: PlayerStorageReader,
        private readonly playerStorageWriter: PlayerStorageWriter,
        private readonly normalIslandStorageWriter: NormalIslandStorageWriter,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly desertedIslandStorageWriter: DesertedIslandStorageWriter,
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
        // 1. 회원 및 섬 존재 여부 디비에서 확인
        const now = new Date().toISOString();
        console.log(`[${now}] joinNormalIsland called for player ${playerId}`);
        const user = await this.userReader.readProfile(playerId);
        const island = await this.islandReader.readOne(islandId);

        const countParticipants =
            await this.normalIslandStorageReader.countPlayerByIsland(islandId);
        if (island.maxMembers <= countParticipants) {
            // 임시 예외 코드
            throw new DomainException(
                DomainExceptionType.ISLAND_FULL,
                1000,
                ISLAND_FULL,
            );
        }

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

        await this.playerStorageWriter.create(player);
        await this.normalIslandStorageWriter.addPlayer(islandId, playerId);

        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: playerId },
            v4,
        );
        await this.islandJoinWriter.create(islandJoin);

        const allPlayers = await this.getActiveUsers(island.type, islandId);
        const activePlayers =
            allPlayers.filter((player) => player.id !== playerId) || [];
        // 여기까지

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

        // 여기부터 동시성 제어 필요.
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

        await this.playerStorageWriter.create(player);
        await this.desertedIslandStorageWriter.addPlayer(islandId, playerId);

        const allPlayers = await this.getActiveUsers(
            availableIsland.type,
            availableIsland.id,
        );
        const activePlayers =
            allPlayers.filter((player) => player.id !== playerId) || [];
        // 여기까지

        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: player.id },
            v4,
        );
        await this.islandJoinWriter.create(islandJoin);

        return {
            activePlayers,
            joinedIslandId: availableIsland.id,
            joinedPlayer: player,
        };
    }

    async createIsland() {
        // DB
        const islandEntity = IslandEntity.create(
            {
                type: IslandTypeEnum.DESERTED,
                maxMembers: UNINHABITED_MAX_MEMBERS,
            },
            v4,
        );
        await this.islandWriter.create(islandEntity);

        // Memory
        return this.createLiveIsland(islandEntity.id);
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

        const { roomId } = player;

        const island =
            player.islandType === IslandTypeEnum.NORMAL
                ? await this.normalIslandStorageReader.readOne(roomId)
                : await this.desertedIslandStorageReader.readOne(roomId);

        await this.islandJoinWriter.left(roomId, player.id);

        await this.playerStorageWriter.remove(playerId);

        if (player.islandType === IslandTypeEnum.NORMAL) {
            await this.normalIslandStorageWriter.removePlayer(
                island.id,
                playerId,
            );
        } else {
            await this.desertedIslandStorageWriter.removePlayer(
                island.id,
                playerId,
            );
        }

        if (island.players.size === 0) {
            await this.normalIslandStorageWriter.remove(island.id);
            await this.islandWriter.remove(island.id);
        }

        return player;
    }

    // NOTE 지우기
    async leaveRoom(islandId: string, playerId: string, type: IslandTypeEnum) {
        const player = await this.playerStorageReader.readOne(playerId);
        const island =
            type === IslandTypeEnum.NORMAL
                ? await this.normalIslandStorageReader.readOne(islandId)
                : await this.desertedIslandStorageReader.readOne(islandId);

        await this.islandJoinWriter.left(islandId, player.id);

        await this.playerStorageWriter.remove(playerId);

        if (player.islandType === IslandTypeEnum.NORMAL) {
            await this.normalIslandStorageWriter.removePlayer(
                island.id,
                playerId,
            );
        } else {
            await this.desertedIslandStorageWriter.removePlayer(
                island.id,
                playerId,
            );
        }

        return player;
    }

    async getActiveUsers(type: IslandTypeEnum, islandId: string) {
        const island =
            type === IslandTypeEnum.NORMAL
                ? await this.normalIslandStorageReader.readOne(islandId)
                : await this.desertedIslandStorageReader.readOne(islandId);

        const activeUsers: Player[] = [];

        for (const playerId of island.players) {
            const player = await this.playerStorageReader.readOne(playerId);
            if (player) {
                activeUsers.push(player);
            }
        }

        return activeUsers;
    }

    async kickPlayerById(playerId: string, type: IslandTypeEnum) {
        try {
            const player = await this.playerStorageReader.readOne(playerId);

            await this.leaveRoom(player.roomId, playerId, type);
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
            const island =
                await this.normalIslandStorageReader.readOne(islandId);

            const isFull = island.max <= island.players.size;
            if (isFull) {
                return {
                    canJoin: false,
                    reason: ISLAND_FULL,
                };
            }

            return { islandId: island.id, canJoin: true };
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.ISLAND_NOT_FOUND
            ) {
                return {
                    canJoin: false,
                    reason: ISLAND_NOT_FOUND_MESSAGE,
                };
            }
            throw e;
        }
    }
}

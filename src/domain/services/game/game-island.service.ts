import { Inject, Injectable } from '@nestjs/common';
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
import { PlayerStorage } from 'src/domain/interface/storages/game-storage';
import { Player } from 'src/domain/models/game/player';
import { JoinedIslandInfo, SocketClientId } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';

@Injectable()
export class GameIslandService {
    constructor(
        @Inject(PlayerStorage)
        private readonly gameStorage: PlayerStorage,
        @Inject(DesertedIslandStorage)
        private readonly desertedIslandStorage: DesertedIslandStorage,
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
        private readonly islandWriter: IslandWriter,
        private readonly islandReader: IslandReader,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly userReader: UserReader,
    ) {}

    async getAvailableDesertedIsland() {
        const islands = this.desertedIslandStorage.getAllIsland();
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
        return this.desertedIslandStorage.getIsland(islandId);
    }

    async joinNormalIsland(
        playerId: string,
        clientId: string,
        islandId: string,
        x: number,
        y: number,
    ): Promise<JoinedIslandInfo> {
        // 1. 회원 및 섬 존재 여부 디비에서 확인
        const user = await this.userReader.readProfile(playerId);
        // TODO 메모리에서 확인해야함
        const island = await this.islandReader.readOne(islandId);

        // 2. 최대 인원 초과 확인
        const countParticipants =
            this.normalIslandStorage.countPlayer(islandId);
        if (island.maxMembers <= countParticipants) {
            // 임시 예외 코드
            throw new DomainException(
                DomainExceptionType.ISLAND_FULL,
                1000,
                'island full',
            );
        }

        // 3. 플레이어 생성 및 섬 참여자 등록
        // 여기부터 동시성 제어 필요
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

        this.gameStorage.addPlayer(playerId, player);
        this.normalIslandStorage.addPlayerToIsland(islandId, playerId);

        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: playerId },
            v4,
        );
        await this.islandJoinWriter.create(islandJoin);

        const activePlayers =
            this.getActiveUsers(island.type, islandId).filter(
                (player) => player.id !== playerId,
            ) || [];
        // 여기까지

        return {
            activePlayers,
            joinedIslandId: islandId,
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

        this.gameStorage.addPlayer(playerId, player);

        availableIsland.players.add(playerId);

        const activePlayers =
            this.getActiveUsers(
                availableIsland.type,
                availableIsland.id,
            ).filter((player) => player.id !== playerId) || [];
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

    createLiveIsland(islandId: string) {
        const island = {
            id: islandId,
            max: UNINHABITED_MAX_MEMBERS,
            players: new Set<SocketClientId>(),
            type: IslandTypeEnum.DESERTED,
        };
        this.desertedIslandStorage.createIsland(islandId, island);

        return island;
    }

    async leftPlayer(playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);

        const island =
            player.islandType === IslandTypeEnum.NORMAL
                ? this.normalIslandStorage.getIsland(player.roomId)
                : this.desertedIslandStorage.getIsland(player.roomId);

        const { roomId } = player;

        await this.islandJoinWriter.left(roomId, player.id);

        this.gameStorage.deletePlayer(playerId);
        island.players.delete(playerId);

        return player;
    }

    async leaveRoom(islandId: string, playerId: string, type: IslandTypeEnum) {
        const player = this.gameStorage.getPlayer(playerId);
        const island =
            type === IslandTypeEnum.NORMAL
                ? this.normalIslandStorage.getIsland(islandId)
                : this.desertedIslandStorage.getIsland(islandId);

        await this.islandJoinWriter.left(islandId, player.id);

        this.gameStorage.deletePlayer(playerId);
        island.players.delete(playerId);

        return player;
    }

    getActiveUsers(type: IslandTypeEnum, islandId: string) {
        const island =
            type === IslandTypeEnum.NORMAL
                ? this.normalIslandStorage.getIsland(islandId)
                : this.desertedIslandStorage.getIsland(islandId);

        const activeUsers: Player[] = [];

        island.players.forEach((playerId) => {
            const player = this.gameStorage.getPlayer(playerId);
            if (player) {
                activeUsers.push(player);
            }
        });

        return activeUsers;
    }

    async kickPlayerById(playerId: string, type: IslandTypeEnum) {
        try {
            const player = this.gameStorage.getPlayer(playerId);

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
}

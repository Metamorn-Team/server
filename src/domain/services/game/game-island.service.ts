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
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { Player } from 'src/domain/models/game/player';
import { JoinedIslandInfo, SocketClientId } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class GameIslandService {
    constructor(
        @Inject(GameStorage)
        private readonly gameStorage: GameStorage,
        private readonly islandWriter: IslandWriter,
        private readonly islandReader: IslandReader,
        private readonly islandJoinWriter: IslandJoinWriter,
        private readonly userReader: UserReader,
    ) {}

    async getAvailableRoom() {
        const islandIds = this.gameStorage.getIslandIdsByTag(
            IslandTypeEnum.DESERTED,
        );

        if (islandIds) {
            for (const islandId of islandIds) {
                const island = this.gameStorage.getIsland(islandId);

                if (island && island.players.size < island.max) {
                    return island;
                }
            }
        }

        return await this.createIsland();
    }

    getIsland(islandId: string) {
        return this.gameStorage.getIsland(islandId);
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
        const island = await this.islandReader.readOne(islandId);

        // 2. 최대 인원 초과 확인
        const countParticipants = this.gameStorage.countPlayer(islandId);
        if (island.maxMembers <= countParticipants) {
            // 임시 예외 코드
            throw new DomainException(
                DomainExceptionType.IslandFull,
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
            tag: user.tag,
            x,
            y,
        });

        this.gameStorage.addPlayer(playerId, player);
        this.gameStorage.addPlayerToIsland(islandId, playerId);

        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: playerId },
            v4,
        );
        await this.islandJoinWriter.create(islandJoin);

        const activePlayers =
            this.getActiveUsers(islandId).filter(
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
        const availableIsland = await this.getAvailableRoom();

        // 여기부터 동시성 제어 필요.
        const { id: islandId } = availableIsland;
        const player = Player.create({
            id: user.id,
            clientId,
            nickname: user.nickname,
            avatarKey: user.avatarKey,
            tag: user.tag,
            roomId: islandId,
            x,
            y,
        });

        this.gameStorage.addPlayer(playerId, player);

        availableIsland.players.add(playerId);

        const activePlayers =
            this.getActiveUsers(availableIsland.id).filter(
                (player) => player.id !== playerId,
            ) || [];
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
        this.gameStorage.createIsland(islandId, island);
        const roomOfTags = this.gameStorage.getIslandOfTag(
            IslandTypeEnum.DESERTED,
        );

        if (roomOfTags) {
            roomOfTags.add(islandId);
        } else {
            this.gameStorage.addIslandOfTag(IslandTypeEnum.DESERTED, islandId);
        }

        return island;
    }

    async leftPlayer(playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);
        if (!player) return;

        const room = this.gameStorage.getIsland(player.roomId);
        if (!room) return;

        const { roomId } = player;

        await this.islandJoinWriter.left(roomId, player.id);

        this.gameStorage.deletePlayer(playerId);
        room.players.delete(playerId);

        return player;
    }

    async leaveRoom(islandId: string, playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);
        if (!player) return;

        const room = this.gameStorage.getIsland(islandId);
        if (!room) return;

        await this.islandJoinWriter.left(islandId, player.id);

        this.gameStorage.deletePlayer(playerId);
        room.players.delete(playerId);

        return player;
    }

    getActiveUsers(islandId: string) {
        const room = this.gameStorage.getIsland(islandId);
        if (!room) throw new Error('없는 방');

        const activeUsers: Player[] = [];

        room.players.forEach((playerId) => {
            const player = this.gameStorage.getPlayer(playerId);
            if (player) {
                activeUsers.push(player);
            }
        });

        return activeUsers;
    }

    async kickPlayerById(playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);
        if (player) {
            await this.leaveRoom(player.roomId, playerId);
            return player;
        }
    }
}

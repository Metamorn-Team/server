import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { Player, RoomType, SocketClientId } from 'src/domain/types/game.types';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';

@Injectable()
export class ZoneService {
    constructor(
        @Inject(GameStorage)
        private readonly gameStorage: GameStorage,
        private readonly islandWriter: IslandWriter,
        private readonly islandJoinWriter: IslandJoinWriter,
    ) {}

    createRoom(type: RoomType) {
        const stdDate = new Date();
        const island = IslandEntity.create({ tag: type }, v4, stdDate);
        this.islandWriter.create(island);

        const { id } = island;

        const room = {
            id,
            max: 5,
            players: new Set<SocketClientId>(),
            type,
        };
        this.gameStorage.createRoom(id, room);
        const roomOfTypes = this.gameStorage.getRoomOfType(type);

        if (roomOfTypes) {
            roomOfTypes.add(id);
        } else {
            this.gameStorage.addRoomOfType(type, id);
        }

        return room;
    }

    getAvailableRoom(type: RoomType) {
        const roomIds = this.gameStorage.getRoomIdsByType(type);

        if (roomIds) {
            for (const roomId of roomIds) {
                const room = this.gameStorage.getRoom(roomId);

                if (room && room.players.size < room.max) {
                    return room;
                }
            }
        }

        return this.createRoom(type);
    }

    async joinRoom(islandId: string, clientId: string, user: Player) {
        const stdDate = new Date();
        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: user.id },
            v4,
            stdDate,
        );
        await this.islandJoinWriter.create(islandJoin);

        this.gameStorage.addPlayer(clientId, user);

        const room = this.gameStorage.getRoom(islandId);
        if (!room) throw new Error('없는 방');

        room.players.add(clientId);
    }

    async leaveRoom(islandId: string, clientId: string) {
        const player = this.gameStorage.getPlayer(clientId);

        if (!player) throw new Error();

        await this.islandJoinWriter.left(islandId, player.id);
        const room = this.gameStorage.getRoom(islandId);

        if (!room) throw new Error('없는 방');

        room.players.delete(clientId);
        this.gameStorage.deletePlayer(clientId);
    }

    getActiveUsers(roomId: string) {
        const room = this.gameStorage.getRoom(roomId);
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

    kickPlayerById(playerId: string) {
        const player = this.gameStorage.getPlayerById(playerId);
        if (player) {
            this.leaveRoom(player.roomId, player.clientId);
            return player;
        }
    }

    getPlayer(clientId: string) {
        return this.gameStorage.getPlayer(clientId);
    }

    loggingStore(logger: Logger) {
        logger.debug('전체 회원', this.gameStorage.getPlayerStore());
        logger.debug('전체 방', this.gameStorage.getRoomStore());
        logger.debug('타입별 방', this.gameStorage.getRoomOfTypeStore());
    }
}

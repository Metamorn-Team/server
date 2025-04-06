import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { Player, RoomType, SocketClientId } from 'src/domain/types/game.types';

@Injectable()
export class ZoneService {
    constructor(
        @Inject(GameStorage)
        private readonly gameStorage: GameStorage,
    ) {}

    createRoom(type: RoomType) {
        const roomId = v4();
        const room = {
            id: roomId,
            max: 5,
            players: new Set<SocketClientId>(),
            type,
        };
        this.gameStorage.createRoom(roomId, room);
        const roomOfTypes = this.gameStorage.getRoomOfType(type);

        if (roomOfTypes) {
            roomOfTypes.add(roomId);
        } else {
            this.gameStorage.addRoomOfType(type, roomId);
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

    joinRoom(roomId: string, clientId: string, user: Player) {
        this.gameStorage.addPlayer(clientId, user);

        const room = this.gameStorage.getRoom(roomId);
        if (!room) throw new Error('없는 방');

        room.players.add(clientId);
    }

    leaveRoom(roomId: string, clientId: string) {
        const room = this.gameStorage.getRoom(roomId);

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

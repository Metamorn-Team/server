import { Player, Room, RoomType } from 'src/domain/types/game.types';

export interface GameStorage {
    getPlayer(clientId: string): Player | null;
    getPlayerById(playerId: string): Player | null;
    addPlayer(clientId: string, player: Player): void;
    deletePlayer(clientId: string): void;

    createRoom(roomId: string, room: Room): void;
    getRoom(roomId: string): Room | null;
    getRoomOfType(type: RoomType): Set<string> | null;
    getRoomIdsByType(type: RoomType): string[];
    addRoomOfType(type: RoomType, roomId: string): void;

    getPlayerStore(): Record<string, Player>;
    getRoomStore(): Record<string, Room>;
    getRoomOfTypeStore(): Record<RoomType, Set<string>>;
}

export const GameStorage = Symbol('GameStorage');

import { GameStorage } from 'src/domain/interface/storages/game-storage';
import {
    Player,
    Room,
    RoomType,
    SocketClientId,
} from 'src/domain/types/game.types';

export class MemoryStorage implements GameStorage {
    private players = new Map<SocketClientId, Player>();
    private rooms = new Map<string, Room>();
    private roomsOfTypes = new Map<RoomType, Set<string>>();

    addPlayer(clientId: string, player: Player): void {
        this.players.set(clientId, player);
    }

    getPlayer(clientId: string): Player | null {
        return this.players.get(clientId) ?? null;
    }

    deletePlayer(clientId: string): void {
        this.players.delete(clientId);
    }

    createRoom(roomId: string, room: Room): void {
        this.rooms.set(roomId, room);
    }

    getRoom(roomId: string): Room | null {
        return this.rooms.get(roomId) ?? null;
    }

    getRoomOfType(type: RoomType): Set<string> | null {
        return this.roomsOfTypes.get(type) ?? null;
    }

    getRoomIdsByType(type: RoomType): string[] {
        return Array.from(this.roomsOfTypes.get(type) ?? []);
    }

    addRoomOfType(type: RoomType, roomId: string): void {
        const roomOfTypes = this.roomsOfTypes.get(type);

        if (roomOfTypes) {
            roomOfTypes.add(roomId);
        } else {
            this.roomsOfTypes.set(type, new Set([roomId]));
        }
    }

    getPlayerStore(): Record<string, Player> {
        return Object.fromEntries(this.players.entries());
    }

    getRoomStore(): Record<string, Room> {
        return Object.fromEntries(this.rooms.entries());
    }

    getRoomOfTypeStore(): Record<RoomType, Set<string>> {
        const result: Record<RoomType, Set<string>> = {} as Record<
            RoomType,
            Set<string>
        >;
        this.roomsOfTypes.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
}

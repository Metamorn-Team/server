import { RoomType } from 'src/domain/types/game.types';

export interface PlayerJoinRequest {
    readonly x: number;
    readonly y: number;
    readonly roomType: RoomType;
}

import { RoomType } from '../../shared';

export interface PlayerJoinRequest {
    readonly x: number;
    readonly y: number;
    readonly roomType: RoomType;
}

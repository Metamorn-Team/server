export type RoomType = 'dev' | 'design';

export type SocketClientId = string;

export interface Player {
    id: string;
    roomId: string;
    nickname: string;
    clientId: string;
    x: number;
    y: number;
}

export interface Room {
    id: string;
    players: Set<string>;
    type: RoomType;
    max: number;
}

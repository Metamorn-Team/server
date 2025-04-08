export type RoomType = 'dev' | 'design';

export type SocketClientId = string;

export interface Player {
    id: string;
    nickname: string;
    tag: string;
    avatarKey: string;
    clientId: string;
    roomId: string;
    x: number;
    y: number;
}

export interface Room {
    id: string;
    players: Set<string>;
    type: RoomType;
    max: number;
}

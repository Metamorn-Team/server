import { Player } from 'src/domain/models/game/player';
import { IslandTypeEnum } from 'src/domain/types/island.types';

export type SocketClientId = string;

export interface LiveIsland {
    id: string;
    players: Set<string>;
    type: IslandTypeEnum;
    max: number;
}

export type LiveDesertedIsland = LiveIsland;

export interface LiveNormalIsland extends LiveIsland {
    name: string;
    description: string;
    coverImage: string;
    tags: string[];
    createdAt: Date;
}

export interface Island {
    readonly id: string;
    readonly name: string | null;
    readonly description: string | null;
    readonly coverImage: string | null;
    readonly maxMembers: number;
    readonly type: IslandTypeEnum;
    readonly tags: string[];
    readonly createdAt: Date;
}

export interface JoinedIslandInfo {
    readonly activePlayers: Player[];
    readonly joinedIslandId: string;
    readonly joinedPlayer: Player;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Circle {
    x: number;
    y: number;
    radius: number;
}

export interface Position {
    x: number;
    y: number;
}

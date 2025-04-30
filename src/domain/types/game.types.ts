import { Player } from 'src/domain/models/game/player';
import { IslandTypeEnum } from 'src/domain/types/island.types';

export type SocketClientId = string;

export interface LiveIsland {
    id: string;
    players: Set<string>;
    type: IslandTypeEnum;
    max: number;
}

export interface Island {
    readonly id: string;
    readonly name: string | null;
    readonly description: string | null;
    readonly coverImage: string | null;
    readonly maxMembers: number;
    readonly type: IslandTypeEnum;
    readonly createdAt: Date;
}

export interface JoinedIslandInfo {
    readonly activePlayers: Player[];
    readonly joinedIslandId: string;
    readonly joinedPlayer: Player;
}

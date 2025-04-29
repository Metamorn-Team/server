import { IslandTypeEnum } from 'src/domain/types/island.types';

export type SocketClientId = string;

export interface Island {
    id: string;
    players: Set<string>;
    type: IslandTypeEnum;
    max: number;
}

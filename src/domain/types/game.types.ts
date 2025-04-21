export type IslandTag = 'dev' | 'design';

export type SocketClientId = string;

export interface Island {
    id: string;
    players: Set<string>;
    type: IslandTag;
    max: number;
}

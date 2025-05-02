import { LiveNormalIsland } from 'src/domain/types/game.types';

export interface NormalIslandStorage {
    createIsland(islandId: string, island: LiveNormalIsland): void;
    getIsland(islandId: string): LiveNormalIsland;
    getAllIsland(): LiveNormalIsland[];
    countPlayer(islandId: string): number;
    addPlayerToIsland(islandId: string, playerId: string): void;
    getIslandStore(): Record<string, LiveNormalIsland>;
    getPlayerIdsByIslandId(islandId: string): string[];
}

export const NormalIslandStorage = Symbol('NormalIslandStorage');

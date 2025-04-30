import { LiveDesertedIsland } from 'src/domain/types/game.types';

export interface DesertedIslandStorage {
    createIsland(islandId: string, island: LiveDesertedIsland): void;
    getIsland(islandId: string): LiveDesertedIsland | null;
    getAllIsland(): LiveDesertedIsland[];
    countPlayer(islandId: string): number;
    addPlayerToIsland(islandId: string, playerId: string): void;
    getIslandStore(): Record<string, LiveDesertedIsland>;
}

export const DesertedIslandStorage = Symbol('DesertedIslandStorage');

import { LiveDesertedIsland } from 'src/domain/types/game.types';

export interface DesertedIslandStorage {
    createIsland(islandId: string, island: LiveDesertedIsland): Promise<void>;
    getIsland(islandId: string): Promise<LiveDesertedIsland>;
    getAllIsland(): Promise<LiveDesertedIsland[]>;
    countPlayer(islandId: string): Promise<number>;
    addPlayerToIsland(islandId: string, playerId: string): Promise<void>;
    removePlayer(islandId: string, playerId: string): Promise<void>;
    // getIslandStore(): Record<string, LiveDesertedIsland>;
    getPlayerIdsByIslandId(islandId: string): Promise<string[]>;
    delete(islandId: string): Promise<void>;
}

export const DesertedIslandStorage = Symbol('DesertedIslandStorage');

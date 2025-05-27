import { LiveNormalIsland } from 'src/domain/types/game.types';
import { NormalIslandUpdateInput } from 'src/domain/types/island.types';

export interface NormalIslandStorage {
    createIsland(island: LiveNormalIsland): Promise<void>;
    getIsland(islandId: string): Promise<LiveNormalIsland | null>;
    getAllIsland(): Promise<LiveNormalIsland[]>;
    countPlayer(islandId: string): Promise<number>;
    addPlayerToIsland(islandId: string, playerId: string): Promise<void>;
    removePlayer(islandId: string, playerId: string): Promise<void>;
    getPlayerIdsByIslandId(islandId: string): Promise<string[]>;
    getFirstPlayerExceptSelf(
        islandId: string,
        playerId: string,
    ): Promise<string | null>;
    update(islandId: string, data: NormalIslandUpdateInput): Promise<void>;
    delete(islandId: string): Promise<void>;
}

export const NormalIslandStorage = Symbol('NormalIslandStorage');

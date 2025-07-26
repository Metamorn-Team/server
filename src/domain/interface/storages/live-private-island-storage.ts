import {
    CreateLivePrivateIsland,
    LivePrivateIsland,
} from 'src/domain/types/private-island.types';

export interface LivePrivateIslandStorage {
    create(island: CreateLivePrivateIsland): Promise<void>;
    get(islandId: string): Promise<LivePrivateIsland | null>;
    countPlayer(islandId: string): Promise<number>;
    addPlayer(islandId: string, playerId: string): Promise<void>;
    removePlayer(islandId: string, playerId: string): Promise<void>;
    delete(islandId: string): Promise<void>;
}

export const LivePrivateIslandStorage = Symbol('LivePrivateIslandStorage');

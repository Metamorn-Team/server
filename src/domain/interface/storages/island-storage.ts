import { LiveIsland } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';

export interface IslandStorage {
    createIsland(islandId: string, island: LiveIsland): void;
    getIsland(islandId: string): LiveIsland | null;
    getIslandOfTag(tag: IslandTypeEnum): Set<string> | null;
    getIslandIdsByTag(tag: IslandTypeEnum): string[];
    addIslandOfTag(tag: IslandTypeEnum, islandId: string): void;
    countPlayer(islandId: string): number;
    addPlayerToIsland(islandId: string, playerId: string): void;
    getIslandStore(): Record<string, LiveIsland>;
    getIslandOfTagStore(): Record<IslandTypeEnum, Set<string>>;
}

export const IslandStorage = Symbol('IslandStorage');

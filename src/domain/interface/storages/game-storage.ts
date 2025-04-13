import { Player, Island, IslandTag } from 'src/domain/types/game.types';

export interface GameStorage {
    getPlayer(playerId: string): Player | null;
    getPlayerByClientId(clientId: string): Player | null;
    addPlayer(playerId: string, player: Player): void;
    deletePlayer(playerId: string): void;

    createIsland(islandId: string, island: Island): void;
    getIsland(islandId: string): Island | null;
    getIslandOfTag(tag: IslandTag): Set<string> | null;
    getIslandIdsByTag(tag: IslandTag): string[];
    addIslandOfTag(tag: IslandTag, islandId: string): void;

    getPlayerStore(): Record<string, Player>;
    getIslandStore(): Record<string, Island>;
    getIslandOfTagStore(): Record<IslandTag, Set<string>>;
}

export const GameStorage = Symbol('GameStorage');

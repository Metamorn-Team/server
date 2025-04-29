import { Player } from 'src/domain/models/game/player';
import { Island } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';

export interface GameStorage {
    getPlayer(playerId: string): Player | null;
    getPlayerByClientId(clientId: string): Player | null;
    addPlayer(playerId: string, player: Player): void;
    deletePlayer(playerId: string): void;
    getPlayersByIslandId(islandId: string): Player[];

    createIsland(islandId: string, island: Island): void;
    getIsland(islandId: string): Island | null;
    getIslandOfTag(tag: IslandTypeEnum): Set<string> | null;
    getIslandIdsByTag(tag: IslandTypeEnum): string[];
    addIslandOfTag(tag: IslandTypeEnum, islandId: string): void;

    getPlayerStore(): Record<string, Player>;
    getIslandStore(): Record<string, Island>;
    getIslandOfTagStore(): Record<IslandTypeEnum, Set<string>>;
}

export const GameStorage = Symbol('GameStorage');

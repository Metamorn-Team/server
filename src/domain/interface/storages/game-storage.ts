import { Player } from 'src/domain/models/game/player';
import { LiveIsland } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';

export interface GameStorage {
    getPlayer(playerId: string): Player | null;
    getPlayerByClientId(clientId: string): Player | null;
    addPlayer(playerId: string, player: Player): void;
    deletePlayer(playerId: string): void;
    getPlayersByIslandId(islandId: string): Player[];

    createIsland(islandId: string, island: LiveIsland): void;
    getIsland(islandId: string): LiveIsland | null;
    getIslandOfTag(tag: IslandTypeEnum): Set<string> | null;
    getIslandIdsByTag(tag: IslandTypeEnum): string[];
    addIslandOfTag(tag: IslandTypeEnum, islandId: string): void;
    countPlayer(islandId: string): number;
    addPlayerToIsland(islandId: string, playerId: string): void;

    getPlayerStore(): Record<string, Player>;
    getIslandStore(): Record<string, LiveIsland>;
    getIslandOfTagStore(): Record<IslandTypeEnum, Set<string>>;
}

export const GameStorage = Symbol('GameStorage');

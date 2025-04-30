import { Player } from 'src/domain/models/game/player';

export interface PlayerStorage {
    getPlayer(playerId: string): Player | null;
    getPlayerByClientId(clientId: string): Player | null;
    addPlayer(playerId: string, player: Player): void;
    deletePlayer(playerId: string): void;
    getPlayersByIslandId(islandId: string): Player[];
    getPlayerStore(): Record<string, Player>;
}

export const PlayerStorage = Symbol('PlayerStorage');

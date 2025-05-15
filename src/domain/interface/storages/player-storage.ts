import { Player } from 'src/domain/models/game/player';

export interface PlayerStorage {
    getPlayer(playerId: string): Promise<Player | null>;
    getPlayerByClientId(clientId: string): Promise<Player | null>;
    addPlayer(playerId: string, player: Player): Promise<void>;
    deletePlayer(playerId: string): Promise<void>;
    getAllPlayers(): Promise<Player[]>;
    updateLastActivity(playerId: string, now?: number): Promise<void>;
    // getPlayerStore(): Record<string, Player>;
}

export const PlayerStorage = Symbol('PlayerStorage');

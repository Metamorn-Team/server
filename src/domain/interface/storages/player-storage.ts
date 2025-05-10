import { Player } from 'src/domain/models/game/player';

export interface PlayerStorage {
    getPlayer(playerId: string): Promise<Player>;
    getPlayerByClientId(clientId: string): Promise<Player>;
    addPlayer(playerId: string, player: Player): Promise<void>;
    deletePlayer(playerId: string): Promise<void>;
    getAllPlayers(): Promise<Player[]>;
    // getPlayerStore(): Record<string, Player>;
}

export const PlayerStorage = Symbol('PlayerStorage');

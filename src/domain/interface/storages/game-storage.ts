import { Player } from 'src/domain/models/game/player';

export interface PlayerStorage {
    getPlayer(playerId: string): Player;
    getPlayerByClientId(clientId: string): Player;
    addPlayer(playerId: string, player: Player): void;
    deletePlayer(playerId: string): void;
    getPlayerStore(): Record<string, Player>;
}

export const PlayerStorage = Symbol('PlayerStorage');

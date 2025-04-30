import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { Player } from 'src/domain/models/game/player';
import { SocketClientId } from 'src/domain/types/game.types';

export class MemoryStorage implements GameStorage {
    private players = new Map<SocketClientId, Player>();

    addPlayer(playerId: string, player: Player): void {
        this.players.set(playerId, player);
    }

    getPlayer(playerId: string): Player | null {
        return this.players.get(playerId) ?? null;
    }

    getPlayerByClientId(clientId: string): Player | null {
        for (const player of this.players.values()) {
            if (player.clientId === clientId) {
                return player;
            }
        }

        return null;
    }

    deletePlayer(playerId: string): void {
        this.players.delete(playerId);
    }

    getPlayersByIslandId(islandId: string): Player[] {
        const activePlayers: Player[] = [];
        const storedPlayers = this.players.values();

        for (const player of storedPlayers) {
            if (player.roomId === islandId) {
                activePlayers.push(player);
            }
        }

        return activePlayers;
    }

    getPlayerStore(): Record<string, Player> {
        return Object.fromEntries(this.players.entries());
    }
}

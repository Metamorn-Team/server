import { Player } from 'src/domain/models/game/player';
import { SocketClientId } from 'src/domain/types/game.types';

export class PlayerMemoryStorage {
    private players = new Map<SocketClientId, Player>();

    addPlayer(player: Player): void {
        this.players.set(player.id, player);
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

    getPlayerStore(): Record<string, Player> {
        return Object.fromEntries(this.players.entries());
    }

    updateLastActivity(id: string, time = Date.now()) {
        const player = this.getPlayer(id);
        if (player) player.lastActivity = time;
    }
}

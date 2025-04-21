import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { Player } from 'src/domain/models/game/player';
import { Island, IslandTag, SocketClientId } from 'src/domain/types/game.types';

export class MemoryStorage implements GameStorage {
    private players = new Map<SocketClientId, Player>();
    private islands = new Map<string, Island>();
    private islandsOfTags = new Map<IslandTag, Set<string>>();

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
        const island = this.islands.get(islandId);
        if (!island) throw new Error('존재하지 않는 섬');

        return Array.from(island.players)
            .map((playerId) => this.players.get(playerId))
            .filter((player) => !!player);
    }

    createIsland(islandId: string, island: Island): void {
        this.islands.set(islandId, island);
    }

    getIsland(islandId: string): Island | null {
        return this.islands.get(islandId) ?? null;
    }

    getIslandOfTag(tag: IslandTag): Set<string> | null {
        return this.islandsOfTags.get(tag) ?? null;
    }

    getIslandIdsByTag(tag: IslandTag): string[] {
        return Array.from(this.islandsOfTags.get(tag) ?? []);
    }

    addIslandOfTag(tag: IslandTag, islandId: string): void {
        const roomOfTypes = this.islandsOfTags.get(tag);

        if (roomOfTypes) {
            roomOfTypes.add(islandId);
        } else {
            this.islandsOfTags.set(tag, new Set([islandId]));
        }
    }

    getPlayerStore(): Record<string, Player> {
        return Object.fromEntries(this.players.entries());
    }

    getIslandStore(): Record<string, Island> {
        return Object.fromEntries(this.islands.entries());
    }

    getIslandOfTagStore(): Record<IslandTag, Set<string>> {
        const result: Record<IslandTag, Set<string>> = {} as Record<
            IslandTag,
            Set<string>
        >;
        this.islandsOfTags.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
}

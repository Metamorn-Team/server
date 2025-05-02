import { Injectable } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { LiveDesertedIsland } from 'src/domain/types/game.types';

@Injectable()
export class DesertedIslandMemoryStorage implements DesertedIslandStorage {
    private desertedIslands = new Map<string, LiveDesertedIsland>();

    createIsland(islandId: string, island: LiveDesertedIsland): void {
        this.desertedIslands.set(islandId, island);
    }

    getIsland(islandId: string): LiveDesertedIsland | null {
        return this.desertedIslands.get(islandId) ?? null;
    }

    getAllIsland(): LiveDesertedIsland[] {
        return Array.from(this.desertedIslands.values());
    }

    countPlayer(islandId: string): number {
        const island = this.desertedIslands.get(islandId);
        if (!island) throw new Error('섬 없음');

        return island.players.size;
    }

    addPlayerToIsland(islandId: string, playerId: string): void {
        const island = this.desertedIslands.get(islandId);
        if (!island) throw new Error('섬 없음');

        island.players.add(playerId);
    }

    getIslandStore(): Record<string, LiveDesertedIsland> {
        return Object.fromEntries(this.desertedIslands.entries());
    }

    getPlayerIdsByIslandId(islandId: string): string[] {
        const island = this.desertedIslands.get(islandId);
        if (!island) throw new Error('섬 없음');

        return Array.from(island.players);
    }
}

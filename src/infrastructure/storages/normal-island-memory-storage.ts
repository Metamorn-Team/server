import { Injectable } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { LiveNormalIsland } from 'src/domain/types/game.types';

@Injectable()
export class NormalIslandMemoryStorage implements NormalIslandStorage {
    private normalIslands = new Map<string, LiveNormalIsland>();

    createIsland(islandId: string, island: LiveNormalIsland): void {
        this.normalIslands.set(islandId, island);
    }

    getIsland(islandId: string): LiveNormalIsland | null {
        return this.normalIslands.get(islandId) ?? null;
    }

    getAllIsland(): LiveNormalIsland[] {
        return Array.from(this.normalIslands.values());
    }

    countPlayer(islandId: string): number {
        const island = this.normalIslands.get(islandId);
        if (!island) throw new Error('섬 없음');

        return island.players.size;
    }

    addPlayerToIsland(islandId: string, playerId: string): void {
        const island = this.normalIslands.get(islandId);
        if (!island) throw new Error('섬 없음');

        island.players.add(playerId);
    }

    getIslandStore(): Record<string, LiveNormalIsland> {
        return Object.fromEntries(this.normalIslands.entries());
    }
}

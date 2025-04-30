import { Injectable } from '@nestjs/common';
import { IslandStorage } from 'src/domain/interface/storages/island-storage';
import { LiveIsland } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class IslandMemoryStorage implements IslandStorage {
    private islands = new Map<string, LiveIsland>();
    private islandsOfTags = new Map<IslandTypeEnum, Set<string>>();

    createIsland(islandId: string, island: LiveIsland): void {
        this.islands.set(islandId, island);
    }

    getIsland(islandId: string): LiveIsland | null {
        return this.islands.get(islandId) ?? null;
    }

    getIslandOfTag(tag: IslandTypeEnum): Set<string> | null {
        return this.islandsOfTags.get(tag) ?? null;
    }

    getIslandIdsByTag(tag: IslandTypeEnum): string[] {
        return Array.from(this.islandsOfTags.get(tag) ?? []);
    }

    addIslandOfTag(tag: IslandTypeEnum, islandId: string): void {
        const roomOfTypes = this.islandsOfTags.get(tag);

        if (roomOfTypes) {
            roomOfTypes.add(islandId);
        } else {
            this.islandsOfTags.set(tag, new Set([islandId]));
        }
    }

    countPlayer(islandId: string): number {
        const island = this.islands.get(islandId);
        if (!island) throw new Error('섬 없음');

        return island.players.size;
    }

    addPlayerToIsland(islandId: string, playerId: string): void {
        const island = this.islands.get(islandId);
        if (!island) throw new Error('섬 없음');

        island.players.add(playerId);
    }

    getIslandStore(): Record<string, LiveIsland> {
        return Object.fromEntries(this.islands.entries());
    }

    getIslandOfTagStore(): Record<IslandTypeEnum, Set<string>> {
        const result: Record<IslandTypeEnum, Set<string>> = {} as Record<
            IslandTypeEnum,
            Set<string>
        >;
        this.islandsOfTags.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
}

import { Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { LiveDesertedIsland } from 'src/domain/types/game.types';

@Injectable()
export class DesertedIslandMemoryStorage implements DesertedIslandStorage {
    private desertedIslands = new Map<string, LiveDesertedIsland>();

    createIsland(islandId: string, island: LiveDesertedIsland): void {
        this.desertedIslands.set(islandId, island);
    }

    getIsland(islandId: string): LiveDesertedIsland {
        const island = this.desertedIslands.get(islandId);
        if (!island) {
            throw new DomainException(
                DomainExceptionType.IslandNotFound,
                1000,
                ISLAND_NOT_FOUND_MESSAGE,
            );
        }

        return island;
    }

    getAllIsland(): LiveDesertedIsland[] {
        return Array.from(this.desertedIslands.values());
    }

    countPlayer(islandId: string): number {
        const island = this.desertedIslands.get(islandId);
        if (!island) {
            throw new DomainException(
                DomainExceptionType.IslandNotFound,
                1000,
                ISLAND_NOT_FOUND_MESSAGE,
            );
        }

        return island.players.size;
    }

    addPlayerToIsland(islandId: string, playerId: string): void {
        const island = this.desertedIslands.get(islandId);
        if (!island) {
            throw new DomainException(
                DomainExceptionType.IslandNotFound,
                1000,
                ISLAND_NOT_FOUND_MESSAGE,
            );
        }

        island.players.add(playerId);
    }

    getIslandStore(): Record<string, LiveDesertedIsland> {
        return Object.fromEntries(this.desertedIslands.entries());
    }

    getPlayerIdsByIslandId(islandId: string): string[] {
        const island = this.desertedIslands.get(islandId);
        if (!island) {
            throw new DomainException(
                DomainExceptionType.IslandNotFound,
                1000,
                ISLAND_NOT_FOUND_MESSAGE,
            );
        }

        return Array.from(island.players);
    }
}

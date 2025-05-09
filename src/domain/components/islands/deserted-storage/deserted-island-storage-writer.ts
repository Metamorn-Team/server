import { Inject, Injectable } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { LiveDesertedIsland } from 'src/domain/types/game.types';

@Injectable()
export class DesertedIslandStorageWriter {
    constructor(
        @Inject(DesertedIslandStorage)
        private readonly desertedIslandStorage: DesertedIslandStorage,
    ) {}

    async create(island: LiveDesertedIsland) {
        await this.desertedIslandStorage.createIsland(island.id, island);
    }

    async addPlayer(islandId: string, playerId: string) {
        await this.desertedIslandStorage.addPlayerToIsland(islandId, playerId);
    }

    async removePlayer(islandId: string, playerId: string) {
        await this.desertedIslandStorage.removePlayer(islandId, playerId);
    }
}

import { Inject } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { LiveNormalIsland } from 'src/domain/types/game.types';
import { NormalIslandUpdateInput } from 'src/domain/types/island.types';

export class NormalIslandStorageWriter {
    constructor(
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
    ) {}

    async create(island: LiveNormalIsland) {
        await this.normalIslandStorage.createIsland(island);
    }

    async addPlayer(islandId: string, playerId: string) {
        await this.normalIslandStorage.addPlayerToIsland(islandId, playerId);
    }

    async removePlayer(islandId: string, playerId: string) {
        await this.normalIslandStorage.removePlayer(islandId, playerId);
    }

    async update(id: string, data: NormalIslandUpdateInput) {
        await this.normalIslandStorage.update(id, data);
    }

    async remove(id: string) {
        await this.normalIslandStorage.delete(id);
    }
}

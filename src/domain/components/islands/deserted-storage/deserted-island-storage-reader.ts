import { Inject, Injectable } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';

@Injectable()
export class DesertedIslandStorageReader {
    constructor(
        @Inject(DesertedIslandStorage)
        private readonly desertedIslandStorage: DesertedIslandStorage,
    ) {}

    readAll() {
        return this.desertedIslandStorage.getAllIsland();
    }

    readOne(id: string) {
        return this.desertedIslandStorage.getIsland(id);
    }

    getAllPlayer(islandId: string) {
        return this.desertedIslandStorage.getPlayerIdsByIslandId(islandId);
    }

    // logging
    getStore() {
        return this.desertedIslandStorage.getIslandStore();
    }
}

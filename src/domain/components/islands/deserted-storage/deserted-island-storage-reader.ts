import { Inject, Injectable } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';

@Injectable()
export class DesertedIslandStorageReader {
    constructor(
        @Inject(DesertedIslandStorage)
        private readonly desertedIslandStorage: DesertedIslandStorage,
    ) {}

    async readAll() {
        return await this.desertedIslandStorage.getAllIsland();
    }

    async readOne(id: string) {
        return await this.desertedIslandStorage.getIsland(id);
    }

    async getAllPlayer(islandId: string) {
        return await this.desertedIslandStorage.getPlayerIdsByIslandId(
            islandId,
        );
    }

    async countPlayer(id: string) {
        return await this.desertedIslandStorage.countPlayer(id);
    }

    // logging
    // getStore() {
    //     return this.desertedIslandStorage.getIslandStore();
    // }
}

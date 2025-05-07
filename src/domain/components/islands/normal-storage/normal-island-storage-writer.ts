import { Inject } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { LiveNormalIsland } from 'src/domain/types/game.types';

export class NormalIslandStorageWriter {
    constructor(
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
    ) {}

    create(island: LiveNormalIsland) {
        this.normalIslandStorage.createIsland(island.id, island);
    }

    remove(id: string) {
        this.normalIslandStorage.delete(id);
    }
}

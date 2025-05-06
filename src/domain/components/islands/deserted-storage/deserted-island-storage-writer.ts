import { Inject, Injectable } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { LiveDesertedIsland } from 'src/domain/types/game.types';

@Injectable()
export class DesertedIslandStorageWriter {
    constructor(
        @Inject(DesertedIslandStorage)
        private readonly desertedIslandStorage: DesertedIslandStorage,
    ) {}

    create(island: LiveDesertedIsland) {
        this.desertedIslandStorage.createIsland(island.id, island);
    }
}

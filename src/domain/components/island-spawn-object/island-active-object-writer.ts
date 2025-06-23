import { Inject, Injectable } from '@nestjs/common';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import { IslandActiveObjectStorage } from 'src/infrastructure/memories/island-active-object-storage';

@Injectable()
export class IslandActiveObjectWriter {
    constructor(
        @Inject(IslandActiveObjectStorage)
        private readonly islandSpawnObjectMemoryStorage: IslandActiveObjectStorage,
    ) {}

    createMany(objects: ActiveObject[]) {
        this.islandSpawnObjectMemoryStorage.createMany(objects);
    }

    deleteAllByIslandId(islandId: string) {
        this.islandSpawnObjectMemoryStorage.deleteAllByIslandId(islandId);
    }
}

import { Injectable } from '@nestjs/common';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import { IslandActiveObjectStorage } from 'src/infrastructure/memories/island-active-object-storage';

@Injectable()
export class IslandActiveObjectReader {
    constructor(
        private readonly islandSpawnObjectMemoryStorage: IslandActiveObjectStorage,
    ) {}

    readAll(islandId: string): ActiveObject[] {
        return this.islandSpawnObjectMemoryStorage.readAll(islandId);
    }
}

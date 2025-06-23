import { Inject, Injectable } from '@nestjs/common';
import { IslandObjectStorage } from 'src/domain/interface/storages/island-object-storage';
import { PersistentObject } from 'src/domain/types/spawn-object/active-object';

@Injectable()
export class IslandObjectReader {
    constructor(
        @Inject(IslandObjectStorage)
        private readonly islandObjectStorage: IslandObjectStorage,
    ) {}

    async readAll(): Promise<PersistentObject[]> {
        return this.islandObjectStorage.readAll();
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { IslandObjectStorage } from 'src/domain/interface/storages/island-object-storage';
import { PersistentObject } from 'src/domain/types/spawn-object/active-object';

@Injectable()
export class IslandObjectWriter {
    constructor(
        @Inject(IslandObjectStorage)
        private readonly islandObjectStorage: IslandObjectStorage,
    ) {}

    createMany(objects: PersistentObject[]): Promise<void> {
        return this.islandObjectStorage.createMany(objects);
    }

    async deleteAllByIslandId(islandId: string): Promise<void> {
        await this.islandObjectStorage.deleteAllByIslandId(islandId);
    }

    markAsDead(islandId: string, ids: string[]): Promise<void> {
        return this.islandObjectStorage.markAsDead(islandId, ids);
    }

    markAsAlive(islandId: string, ids: string[]): Promise<void> {
        return this.islandObjectStorage.markAsAlive(islandId, ids);
    }
}

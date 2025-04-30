import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import {
    IslandEntity,
    IslandPrototype,
} from 'src/domain/entities/islands/island.entity';
import { IslandStorage } from 'src/domain/interface/storages/island-storage';

@Injectable()
export class IslandService {
    constructor(
        @Inject(IslandStorage)
        private readonly islandStorage: IslandStorage,
        private readonly islandWriter: IslandWriter,
    ) {}

    async create(prototype: IslandPrototype) {
        const island = IslandEntity.create(prototype, v4);
        this.islandStorage.createIsland(island.id, {
            id: island.id,
            max: island.maxMembers,
            players: new Set(),
            type: prototype.type,
        });
        this.islandStorage.addIslandOfTag(island.type, island.id);

        await this.islandWriter.create(island);
    }
}

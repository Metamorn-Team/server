import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import {
    IslandEntity,
    IslandPrototype,
} from 'src/domain/entities/islands/island.entity';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class IslandService {
    constructor(
        @Inject(DesertedIslandStorage)
        private readonly islandStorage: DesertedIslandStorage,
        private readonly islandWriter: IslandWriter,
    ) {}

    async create(prototype: IslandPrototype) {
        const island = IslandEntity.create(prototype, v4);
        this.islandStorage.createIsland(island.id, {
            id: island.id,
            max: island.maxMembers,
            players: new Set(),
            type: IslandTypeEnum.NORMAL,
        });

        await this.islandWriter.create(island);
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import {
    IslandEntity,
    IslandPrototype,
} from 'src/domain/entities/islands/island.entity';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';

@Injectable()
export class IslandService {
    constructor(
        @Inject(NormalIslandStorage)
        private readonly islandStorage: NormalIslandStorage,
        private readonly islandWriter: IslandWriter,
    ) {}

    async create(prototype: IslandPrototype) {
        const island = IslandEntity.create(prototype, v4);
        this.islandStorage.createIsland(island.id, {
            id: island.id,
            max: island.maxMembers,
            players: new Set(),
            type: IslandTypeEnum.NORMAL,
            coverImage: island.coverImage || '',
            createdAt: island.createdAt || new Date(),
            description: island.description || '알 수 없는 섬',
            name: island.name || '알 수 없는 섬',
        });
        await this.islandWriter.create(island);

        console.log(
            `전체 섬: ${JSON.stringify(this.islandStorage.getAllIsland(), null, 2)}`,
        );
        return island.id;
    }
}

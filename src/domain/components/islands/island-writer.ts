import { Inject, Injectable } from '@nestjs/common';
import {
    IslandEntity,
    IslandPrototype,
} from 'src/domain/entities/islands/island.entity';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { NormalIslandUpdateInput } from 'src/domain/types/island.types';
import { v4 } from 'uuid';

@Injectable()
export class IslandWriter {
    constructor(
        @Inject(IslandRepository)
        private readonly islandRepository: IslandRepository,
    ) {}

    async create(prototype: IslandPrototype) {
        const island = IslandEntity.create(prototype, v4);
        await this.islandRepository.save(island);

        return island;
    }

    async update(id: string, data: NormalIslandUpdateInput) {
        await this.islandRepository.update(id, data);
    }

    async remove(id: string) {
        await this.islandRepository.delete(id);
    }
}

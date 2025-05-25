import { Inject, Injectable } from '@nestjs/common';
import {
    IslandEntity,
    IslandPrototype,
} from 'src/domain/entities/islands/island.entity';
import { IslandRepository } from 'src/domain/interface/island.repository';
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

    async remove(id: string) {
        await this.islandRepository.delete(id);
    }
}

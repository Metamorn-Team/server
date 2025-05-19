import { Inject, Injectable } from '@nestjs/common';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandRepository } from 'src/domain/interface/island.repository';

@Injectable()
export class IslandWriter {
    constructor(
        @Inject(IslandRepository)
        private readonly islandRepository: IslandRepository,
    ) {}

    async create(island: IslandEntity) {
        await this.islandRepository.save(island);
    }

    async remove(id: string) {
        await this.islandRepository.delete(id);
    }
}

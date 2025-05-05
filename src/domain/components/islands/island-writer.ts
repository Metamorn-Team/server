import { Inject, Injectable } from '@nestjs/common';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';

@Injectable()
export class IslandWriter {
    constructor(
        @Inject(IslandRepository)
        private readonly islandRepository: IslandRepository,
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
    ) {}

    async create(island: IslandEntity) {
        await this.islandRepository.save(island);
    }

    async remove(id: string) {
        await this.islandRepository.delete(id);
        this.normalIslandStorage.delete(id);
    }
}

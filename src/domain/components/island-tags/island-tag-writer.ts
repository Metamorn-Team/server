import { Inject, Injectable } from '@nestjs/common';
import { IslandTagEntity } from 'src/domain/entities/tag/island-tag.entity';
import { IslandTagRepository } from 'src/domain/interface/island-tag.repository';

@Injectable()
export class IslandTagWriter {
    constructor(
        @Inject(IslandTagRepository)
        private readonly islandTagRepository: IslandTagRepository,
    ) {}

    async createMany(tagIds: string[], islandId: string) {
        const islandTags = tagIds.map((tagId) =>
            IslandTagEntity.create({ tagId, islandId }),
        );
        await this.islandTagRepository.saveMany(islandTags);

        return islandTags;
    }
}

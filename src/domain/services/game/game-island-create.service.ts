import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import {
    IslandEntity,
    IslandPrototype,
} from 'src/domain/entities/islands/island.entity';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { IslandTagEntity } from 'src/domain/entities/tag/island-tag.entity';
import { TagReader } from 'src/domain/components/tags/tag-reader';
import { TAG_AT_LEAST_ONE_MESSAGE } from 'src/domain/exceptions/message';
import { Transactional } from '@nestjs-cls/transactional';
import { IslandTagWriter } from 'src/domain/components/island-tags/island-tag-writer';
import { NormalIslandStorageWriter } from 'src/domain/components/islands/normal-storage/normal-island-storage-writer';

@Injectable()
export class GameIslandCreateService {
    constructor(
        private readonly normalIslandStorageWriter: NormalIslandStorageWriter,
        private readonly islandWriter: IslandWriter,
        private readonly tagReader: TagReader,
        private readonly islandTagWriter: IslandTagWriter,
    ) {}

    async create(prototype: IslandPrototype, tagNames: string[]) {
        const tags = await this.tagReader.readByNames(tagNames);

        if (tags.length < 1) {
            throw new DomainException(
                DomainExceptionType.TAG_AT_LEAST_ONE,
                TAG_AT_LEAST_ONE_MESSAGE,
            );
        }

        const island = IslandEntity.create(prototype, v4);
        const islandTags = IslandTagEntity.createBulk(
            tags.map((tag) => ({ tagId: tag.id, islandId: island.id })),
        );

        await this.createTransaction(island, islandTags);

        const normalIsland = {
            id: island.id,
            max: island.maxMembers,
            players: new Set<string>(),
            type: IslandTypeEnum.NORMAL,
            coverImage: island.coverImage || '',
            createdAt: island.createdAt || new Date(),
            description: island.description || '알 수 없는 섬',
            name: island.name || '알 수 없는 섬',
            tags: tagNames,
        };
        this.normalIslandStorageWriter.create(normalIsland);

        return island.id;
    }

    @Transactional()
    async createTransaction(
        island: IslandEntity,
        islandTags: IslandTagEntity[],
    ) {
        await this.islandWriter.create(island);
        await this.islandTagWriter.createMany(islandTags);
    }
}

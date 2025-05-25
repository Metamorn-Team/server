import { HttpStatus, Injectable } from '@nestjs/common';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandPrototype } from 'src/domain/entities/islands/island.entity';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
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
                HttpStatus.BAD_REQUEST,
                TAG_AT_LEAST_ONE_MESSAGE,
            );
        }

        const { island } = await this.createTransaction(
            prototype,
            tags.map((tag) => tag.id),
        );

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
        await this.normalIslandStorageWriter.create(normalIsland);

        return island.id;
    }

    @Transactional()
    async createTransaction(prototype: IslandPrototype, tagIds: string[]) {
        const island = await this.islandWriter.create(prototype);
        const tags = await this.islandTagWriter.createMany(tagIds, island.id);

        return {
            island,
            tags,
        };
    }
}

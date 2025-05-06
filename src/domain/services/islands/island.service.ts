import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import {
    IslandEntity,
    IslandPrototype,
} from 'src/domain/entities/islands/island.entity';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { IslandTagEntity } from 'src/domain/entities/tag/island-tag.entity';
import { TagReader } from 'src/domain/components/tags/tag-reader';
import { TAG_AT_LEAST_ONE_MESSAGE } from 'src/domain/exceptions/message';
import { Transactional } from '@nestjs-cls/transactional';
import { IslandTagWriter } from 'src/domain/components/island-tags/island-tag-writer';

@Injectable()
export class IslandService {
    constructor(
        @Inject(NormalIslandStorage)
        private readonly islandStorage: NormalIslandStorage,
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

        this.islandStorage.createIsland(island.id, {
            id: island.id,
            max: island.maxMembers,
            players: new Set(),
            type: IslandTypeEnum.NORMAL,
            coverImage: island.coverImage || '',
            createdAt: island.createdAt || new Date(),
            description: island.description || '알 수 없는 섬',
            name: island.name || '알 수 없는 섬',
            tags: tagNames,
        });

        console.log(
            `전체 섬: ${JSON.stringify(this.islandStorage.getAllIsland(), null, 2)}`,
        );
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

    checkCanJoin(islandId: string): {
        islandId?: string;
        canJoin: boolean;
        reason?: string;
    } {
        try {
            const island = this.islandStorage.getIsland(islandId);

            const isFull = island.max <= island.players.size;
            if (isFull) {
                return {
                    canJoin: false,
                    reason: '섬에 자리가 없어요..',
                };
            }

            return { islandId: island.id, canJoin: true };
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.ISLAND_NOT_FOUND
            ) {
                return {
                    canJoin: false,
                    reason: '이미 사라진 섬이에요..',
                };
            }
            throw e;
        }
    }
}

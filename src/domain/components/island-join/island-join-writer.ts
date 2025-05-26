import { Inject, Injectable } from '@nestjs/common';
import {
    IslandJoinEntity,
    IslandJoinPrototype,
} from 'src/domain/entities/island-join/island-join.entity';
import { IslandJoinRepository } from 'src/domain/interface/island-join.repository';
import { v4 } from 'uuid';

@Injectable()
export class IslandJoinWriter {
    constructor(
        @Inject(IslandJoinRepository)
        private readonly islandJoinRepository: IslandJoinRepository,
    ) {}

    async create(prototype: IslandJoinPrototype) {
        const islandJoin = IslandJoinEntity.create(
            { islandId: prototype.islandId, userId: prototype.userId },
            v4,
        );
        await this.islandJoinRepository.save(islandJoin);
    }

    async left(islandId: string, userId: string) {
        await this.islandJoinRepository.update(userId, islandId, new Date());
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandJoinRepository } from 'src/domain/interface/island-join.repository';

@Injectable()
export class IslandJoinWriter {
    constructor(
        @Inject(IslandJoinRepository)
        private readonly islandJoinRepository: IslandJoinRepository,
    ) {}

    async create(islandJoin: IslandJoinEntity) {
        await this.islandJoinRepository.save(islandJoin);
    }

    async left(islandId: string, userId: string) {
        await this.islandJoinRepository.update(userId, islandId, new Date());
    }
}

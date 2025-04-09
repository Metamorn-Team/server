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
}

import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class IslandService {
    constructor(private readonly islandWriter: IslandWriter) {}

    async create(type: IslandTypeEnum) {
        const stdDate = new Date();
        const island = IslandEntity.create(
            { maxMembers: 5, type },
            v4,
            stdDate,
        );

        await this.islandWriter.create(island);
    }
}

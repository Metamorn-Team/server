import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';

@Injectable()
export class IslandService {
    constructor(private readonly islandWriter: IslandWriter) {}

    async create(tag: string) {
        const stdDate = new Date();
        const island = IslandEntity.create({ tag }, v4, stdDate);

        await this.islandWriter.create(island);
    }
}

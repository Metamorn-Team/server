import { Injectable } from '@nestjs/common';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { v4 } from 'uuid';

@Injectable()
export class IslandJoinService {
    constructor(private readonly islandJoinWriter: IslandJoinWriter) {}

    async create(islandId: string, userId: string) {
        const stdDate = new Date();
        const islandJoin = IslandJoinEntity.create(
            { islandId, userId },
            v4,
            stdDate,
        );

        await this.islandJoinWriter.create(islandJoin);
    }
}

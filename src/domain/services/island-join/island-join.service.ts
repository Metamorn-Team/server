import { Injectable } from '@nestjs/common';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';

@Injectable()
export class IslandJoinService {
    constructor(private readonly islandJoinWriter: IslandJoinWriter) {}

    async create(islandId: string, userId: string) {
        await this.islandJoinWriter.create({ islandId, userId });
    }
}

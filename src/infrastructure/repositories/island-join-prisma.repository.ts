import { Injectable } from '@nestjs/common';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandJoinRepository } from 'src/domain/interface/island-join.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class IslandJoinPrismaRepository implements IslandJoinRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: IslandJoinEntity): Promise<void> {
        await this.prisma.islandJoin.create({ data });
    }
}

import { Injectable } from '@nestjs/common';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class IslandPrismaRepository implements IslandRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: IslandEntity): Promise<void> {
        await this.prisma.island.create({ data });
    }
}

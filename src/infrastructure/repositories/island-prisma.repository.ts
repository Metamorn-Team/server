import { Injectable } from '@nestjs/common';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { Island } from 'src/domain/types/game.types';
import { convertNumberToIslandType } from 'src/domain/types/island.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class IslandPrismaRepository implements IslandRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(data: IslandEntity): Promise<void> {
        await this.prisma.island.create({ data });
    }

    async findOneById(id: string): Promise<Island | null> {
        const result = await this.prisma.island.findUnique({
            select: {
                id: true,
                name: true,
                description: true,
                coverImage: true,
                maxMembers: true,
                type: true,
                createdAt: true,
            },
            where: {
                id,
                deletedAt: null,
            },
        });

        return result
            ? {
                  ...result,
                  type: convertNumberToIslandType(result.type),
              }
            : null;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.island.update({
            data: { deletedAt: new Date() },
            where: { id },
        });
    }
}

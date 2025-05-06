import { Injectable } from '@nestjs/common';
import { TagRepository } from 'src/domain/interface/tag.repository';
import { Tag } from 'src/domain/types/tag.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class TagPrismaRepository implements TagRepository {
    constructor(readonly prisma: PrismaService) {}

    async findOneByName(name: string): Promise<Tag | null> {
        return await this.prisma.tag.findUnique({
            select: { id: true, name: true },
            where: { name },
        });
    }

    async findByNames(names: string[]): Promise<Tag[]> {
        return await this.prisma.tag.findMany({
            select: {
                id: true,
                name: true,
            },
            where: {
                name: {
                    in: names,
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
}

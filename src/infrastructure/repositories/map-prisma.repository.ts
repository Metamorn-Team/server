import { Injectable } from '@nestjs/common';
import { MapRepository } from 'src/domain/interface/map.repository';
import { Map } from 'src/domain/types/map.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class MapPrismaRepository implements MapRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByKey(key: string): Promise<Map | null> {
        return this.prisma.map.findUnique({
            select: {
                id: true,
                key: true,
                name: true,
                description: true,
                image: true,
                createdAt: true,
            },
            where: { key },
        });
    }

    async findAll(): Promise<Map[]> {
        return this.prisma.map.findMany({
            select: {
                id: true,
                key: true,
                name: true,
                description: true,
                image: true,
                createdAt: true,
            },
        });
    }
}

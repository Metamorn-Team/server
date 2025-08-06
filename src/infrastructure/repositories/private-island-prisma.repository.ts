import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrivateIslandEntity } from 'src/domain/entities/islands/private-island.entity';
import { PrivateIslandRepository } from 'src/domain/interface/private-island.repository';
import {
    GetPaginatedMyIslandsInput,
    PrivateIsland,
} from 'src/domain/types/private-island.types';

@Injectable()
export class PrivateIslandPrismaRepository implements PrivateIslandRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async create(data: PrivateIslandEntity): Promise<void> {
        await this.txHost.tx.privateIsland.create({ data });
    }

    async existByUrlPath(urlPath: string): Promise<boolean> {
        const result = await this.txHost.tx.privateIsland.findFirst({
            select: { id: true },
            where: { urlPath },
        });

        return !!result;
    }

    async findPaginatedMine(
        input: GetPaginatedMyIslandsInput,
    ): Promise<PrivateIsland[]> {
        const { userId: ownerId, limit, order, page, sortBy } = input;

        const result = await this.txHost.tx.privateIsland.findMany({
            select: {
                id: true,
                ownerId: true,
                urlPath: true,
                name: true,
                isPublic: true,
                maxMembers: true,
                password: true,
                description: true,
                coverImage: true,
                createdAt: true,
                map: {
                    select: {
                        key: true,
                    },
                },
            },
            where: {
                ownerId,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [sortBy]: order,
            },
        });

        return result.map((v) => {
            const { map, ...rest } = v;
            return {
                ...rest,
                mapKey: map.key,
            };
        });
    }

    async countByOwner(ownerId: string): Promise<number> {
        return await this.txHost.tx.privateIsland.count({
            where: { ownerId },
        });
    }
}

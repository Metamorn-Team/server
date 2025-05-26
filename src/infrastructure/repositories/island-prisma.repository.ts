import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { Island } from 'src/domain/types/game.types';
import {
    convertNumberToIslandType,
    IslandSummary,
} from 'src/domain/types/island.types';

@Injectable()
export class IslandPrismaRepository implements IslandRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async save(data: IslandEntity): Promise<void> {
        await this.txHost.tx.island.create({ data });
    }

    async findOneById(id: string): Promise<Island | null> {
        const result = await this.txHost.tx.island.findUnique({
            select: {
                id: true,
                name: true,
                description: true,
                coverImage: true,
                maxMembers: true,
                type: true,
                createdAt: true,
                islandTags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
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
                  tags: result.islandTags.map((tag) => tag.tag.name),
              }
            : null;
    }

    async findSummaryById(id: string): Promise<IslandSummary | null> {
        return this.txHost.tx.island
            .findUnique({
                select: {
                    id: true,
                    name: true,
                    coverImage: true,
                    maxMembers: true,
                    type: true,
                    createdAt: true,
                    ownerId: true,
                },
                where: {
                    id,
                    deletedAt: null,
                },
            })
            .then((result) => {
                return result
                    ? {
                          ...result,
                          type: convertNumberToIslandType(result.type),
                      }
                    : null;
            });
    }

    async update(id: string, data: Partial<IslandEntity>): Promise<void> {
        const { ownerId, coverImage, description, maxMembers, name } = data;

        await this.txHost.tx.island.update({
            data: {
                ownerId,
                coverImage,
                description,
                maxMembers,
                name,
                updatedAt: new Date(),
            },
            where: { id },
        });
    }

    async delete(id: string): Promise<void> {
        await this.txHost.tx.island.update({
            data: { deletedAt: new Date() },
            where: { id },
        });
    }
}

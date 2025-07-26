import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrivateIslandEntity } from 'src/domain/entities/islands/private-island.entity';
import { PrivateIslandRepository } from 'src/domain/interface/private-island.repository';

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
}

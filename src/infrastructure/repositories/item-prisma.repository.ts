import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { ItemRepository } from 'src/domain/interface/item.repository';

@Injectable()
export class ItemPrismaRepository implements ItemRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async existById(id: string): Promise<boolean> {
        const result = await this.txHost.tx.item.findUnique({
            select: { id: true },
            where: {
                id,
            },
        });

        return !!result;
    }
}

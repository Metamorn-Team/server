import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GoldTransactionEntity } from 'src/domain/entities/gold-transaction/gold-transaction.entity';
import { GoldTransactionRepository } from 'src/domain/interface/gold-transaction.repository';

@Injectable()
export class GoldTransactionPrismaRepository
    implements GoldTransactionRepository
{
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async save(data: GoldTransactionEntity): Promise<void> {
        await this.txHost.tx.goldTransaction.create({ data });
    }
}

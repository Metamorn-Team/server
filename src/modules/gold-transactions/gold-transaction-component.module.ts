import { Module } from '@nestjs/common';
import { GoldTransactionWrtier } from 'src/domain/components/gold-transactions/gold-transaction-writer';
import { GoldTransactionRepositor } from 'src/domain/interface/gold-transaction.repository';
import { GoldTransactionPrismaRepository } from 'src/infrastructure/repositories/gold-transaction-prisma.repository';

@Module({
    providers: [
        GoldTransactionWrtier,
        {
            provide: GoldTransactionRepositor,
            useClass: GoldTransactionPrismaRepository,
        },
    ],
    exports: [GoldTransactionWrtier],
})
export class GoldTransactionComponentModule {}

import { GoldTransactionEntity } from 'src/domain/entities/gold-transaction/gold-transaction.entity';

export interface GoldTransactionRepository {
    save(data: GoldTransactionEntity): Promise<void>;
}

export const GoldTransactionRepositor = Symbol('GoldTransactionRepository');

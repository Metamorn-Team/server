import { GoldTransactionTypeEnum } from 'src/domain/types/gold-transaction.types';

export class GoldTransactionEntity {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly type: GoldTransactionTypeEnum,
        readonly amount: number,
        readonly balance: number,
        readonly processedAt: Date,
        readonly referenceIds: string[] = [],
    ) {}

    static create(
        proto: {
            userId: string;
            type: GoldTransactionTypeEnum;
            amount: number;
            balance: number;
            referenceIds?: string[];
        },
        idGen: () => string,
        stdDate = new Date(),
    ) {
        return new GoldTransactionEntity(
            idGen(),
            proto.userId,
            proto.type,
            proto.amount,
            proto.balance,
            stdDate,
            proto.referenceIds,
        );
    }
}

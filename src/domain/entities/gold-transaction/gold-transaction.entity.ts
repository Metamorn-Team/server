import { GoldTransactionType } from 'src/domain/types/gold-transaction';

export class GoldTransactionEntity {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly type: GoldTransactionType,
        readonly amount: number,
        readonly balance: number,
        readonly referenceId: string,
        readonly processedAt: Date,
    ) {}

    static create(
        proto: {
            userId: string;
            type: GoldTransactionType;
            amount: number;
            balance: number;
            referenceId: string;
        },
        idGen: () => string,
        stdDate: Date,
    ) {
        return new GoldTransactionEntity(
            idGen(),
            proto.userId,
            proto.type,
            proto.amount,
            proto.balance,
            proto.referenceId,
            stdDate,
        );
    }
}

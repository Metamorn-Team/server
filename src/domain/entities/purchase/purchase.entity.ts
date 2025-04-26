import { PurchaseStatus } from 'src/domain/types/purchase';

export class PurchaseEntity {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly productId: string,
        readonly goldAmount: number,
        readonly status: PurchaseStatus,
        readonly purchasedAt: Date,
        readonly refundedAt: Date | null = null,
    ) {}

    static create(
        proto: {
            userId: string;
            productId: string;
            goldAmount: number;
            status: PurchaseStatus;
        },
        idGen: () => string,
        stdDate: Date,
    ) {
        return new PurchaseEntity(
            idGen(),
            proto.userId,
            proto.productId,
            proto.goldAmount,
            proto.status,
            stdDate,
        );
    }
}

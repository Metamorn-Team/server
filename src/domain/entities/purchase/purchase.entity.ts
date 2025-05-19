import { PurchaseStatusEnum } from 'src/domain/types/purchase.types';

export class PurchaseEntity {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly productId: string,
        readonly goldAmount: number,
        readonly purchasedAt: Date,
        readonly status = PurchaseStatusEnum.COMPLETE,
        readonly refundedAt: Date | null = null,
    ) {}

    static create(
        proto: {
            userId: string;
            productId: string;
            goldAmount: number;
            status?: PurchaseStatusEnum;
        },
        idGen: () => string,
        stdDate = new Date(),
    ) {
        return new PurchaseEntity(
            idGen(),
            proto.userId,
            proto.productId,
            proto.goldAmount,
            stdDate,
            proto.status,
        );
    }

    static createBulk(
        userId: string,
        protos: {
            productId: string;
            goldAmount: number;
            status?: PurchaseStatusEnum;
        }[],
        idGen: () => string,
        stdDate = new Date(),
    ) {
        return protos.map((proto) => {
            const { goldAmount, productId, status } = proto;
            return this.create(
                { userId, productId, goldAmount, status },
                idGen,
                stdDate,
            );
        });
    }
}

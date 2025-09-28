import { PaymentProductTypesEnum } from 'src/domain/types/payment-products/payment-product.types';
import { PaymentStatus } from 'src/domain/types/payments/payment.types';

export interface PaymentPrototype {
    merchantPaymentId: string;
    userId: string;
    type: PaymentProductTypesEnum;
    paymentProductId: string;
    amount: number;
    status: PaymentStatus;
    currency: string;
    method?: string | null;
    methodDetail?: string | null;
}

export class PaymentEntity {
    constructor(
        public id: string,
        public merchantPaymentId: string,
        public userId: string,
        public type: PaymentProductTypesEnum,
        public paymentProductId: string,
        public amount: number,
        public status: PaymentStatus,
        public currency: string,
        public createdAt: Date,
        public method?: string | null,
        public methodDetail?: string | null,
    ) {}

    static create(
        proto: PaymentPrototype,
        idGen: () => string,
        stdDate = new Date(),
    ) {
        return new PaymentEntity(
            idGen(),
            proto.merchantPaymentId,
            proto.userId,
            proto.type,
            proto.paymentProductId,
            proto.amount,
            proto.status,
            proto.currency,
            stdDate,
            proto.method,
            proto.methodDetail,
        );
    }
}

import { PaymentEntity } from 'src/domain/entities/payments/payment.entity';
import {
    PaymentRecord,
    PaymentStatus,
    UpdatePaymentInput,
} from 'src/domain/types/payments/payment.types';

export interface PaymentRepository {
    save(data: PaymentEntity): Promise<void>;
    findOneByMerchantPaymentId(
        merchantPaymentId: string,
    ): Promise<PaymentRecord | null>;
    update(id: string, data: UpdatePaymentInput): Promise<void>;
    updateStatus(id: string, status: PaymentStatus): Promise<void>;
}

export const PaymentRepository = Symbol('PaymentRepository');

import { PaymentEntity } from 'src/domain/entities/payments/payment.entity';
import { PaymentStatus } from 'src/domain/types/payments/payment.types';

export interface PaymentRepository {
    save(data: PaymentEntity): Promise<void>;
    findOneByMerchantPaymentId(
        merchantPaymentId: string,
    ): Promise<{ status: PaymentStatus } | null>;
    updateStatus(id: string, status: PaymentStatus): Promise<void>;
}

export const PaymentRepository = Symbol('PaymentRepository');

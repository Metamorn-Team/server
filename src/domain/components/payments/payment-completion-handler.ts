import { Payment } from 'src/domain/types/payments/payment.types';

export interface PaymentCompletionHandler {
    handle(data: Payment): Promise<void>;
}

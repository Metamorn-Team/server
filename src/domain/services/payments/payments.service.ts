import { Injectable } from '@nestjs/common';
import { PaymentCompletionHandlerFactory } from 'src/domain/components/payments/payment-completion-handler-factory';
import { Payment } from 'src/domain/types/payments/payment.types';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly PaymentCompletionHandlerFactory: PaymentCompletionHandlerFactory,
    ) {}

    async completePayment(payment: Payment) {
        await this.PaymentCompletionHandlerFactory.getHandler(
            payment.productType,
        ).handle(payment);
    }
}

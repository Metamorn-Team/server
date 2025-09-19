import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PAYMENT_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { PaymentRepository } from 'src/domain/interface/payment.repository';
import { PaymentStatus } from 'src/domain/types/payments/payment.types';

@Injectable()
export class PaymentReader {
    constructor(
        @Inject(PaymentRepository)
        private readonly paymentRepository: PaymentRepository,
    ) {}

    async getStatus(id: string): Promise<PaymentStatus> {
        const payment =
            await this.paymentRepository.findOneByMerchantPaymentId(id);
        if (!payment) {
            throw new DomainException(
                DomainExceptionType.PAYMENT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                PAYMENT_NOT_FOUND_MESSAGE(id),
            );
        }

        return payment.status;
    }
}

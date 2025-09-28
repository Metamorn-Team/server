import { Transactional } from '@nestjs-cls/transactional';
import { HttpStatus, Injectable } from '@nestjs/common';
import { GoldChargePaymentProductReader } from 'src/domain/components/payment-products/gold-charge-payment-product-reader';
import { PaymentCompletionHandler } from 'src/domain/components/payments/payment-completion-handler';
import { PaymentReader } from 'src/domain/components/payments/payment-reader';
import { PaymentWriter } from 'src/domain/components/payments/payment-writer';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PAYMENT_AMOUNT_MISMATCH_MESSAGE } from 'src/domain/exceptions/message';
import { Payment } from 'src/domain/types/payments/payment.types';

@Injectable()
export class GoldChargeCompletionHandler implements PaymentCompletionHandler {
    constructor(
        private readonly goldChargePaymentProductReader: GoldChargePaymentProductReader,
        private readonly paymentWriter: PaymentWriter,
        private readonly paymentReader: PaymentReader,
        private readonly userWriter: UserWriter,
    ) {}

    async handle(data: Payment): Promise<void> {
        const product = await this.goldChargePaymentProductReader.readOne(
            data.productId,
        );
        const payment = await this.paymentReader.readOneByMerchantPaymentId(
            data.paymentId,
        );

        if (
            data.totalPrice !== product.price ||
            data.productId !== payment.paymentProductId
        ) {
            throw new DomainException(
                DomainExceptionType.PAYMENT_AMOUNT_MISMATCH,
                HttpStatus.UNPROCESSABLE_ENTITY,
                PAYMENT_AMOUNT_MISMATCH_MESSAGE,
            );
        }

        // 골드 충전
        await this.transaction(
            payment.id,
            data.userId,
            product.amount,
            data.paymentMethod,
            data.paymentMethodDetail,
        );
    }

    @Transactional()
    async transaction(
        paymentRecordId: string,
        userId: string,
        goldAmount: number,
        method?: string | null,
        methodDetail?: string | null,
    ) {
        await this.userWriter.incrementGoldBalance(userId, goldAmount);
        await this.paymentWriter.update(paymentRecordId, {
            method,
            methodDetail,
            status: 'COMPLETE',
        });
    }
}

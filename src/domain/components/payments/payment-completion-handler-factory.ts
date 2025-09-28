import { Injectable } from '@nestjs/common';
import { GoldChargeCompletionHandler } from 'src/domain/components/payments/gold-charge-completion-handler';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { INVALID_PAYMENT_PRODUCT_TYPE_MESSAGE } from 'src/domain/exceptions/message';
import { PaymentProductTypesEnum } from 'src/domain/types/payment-products/payment-product.types';

@Injectable()
export class PaymentCompletionHandlerFactory {
    constructor(
        private readonly goldChargeCompletionHandler: GoldChargeCompletionHandler,
    ) {}

    getHandler(type: PaymentProductTypesEnum) {
        switch (type) {
            case PaymentProductTypesEnum.GOLD_CHARGE:
                return this.goldChargeCompletionHandler;
            default:
                throw new DomainException(
                    DomainExceptionType.INVALID_PAYMENT_PRODUCT_TYPE,
                    INVALID_PAYMENT_PRODUCT_TYPE_MESSAGE(type),
                );
        }
    }
}

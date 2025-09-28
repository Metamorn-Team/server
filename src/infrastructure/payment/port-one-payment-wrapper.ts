import { Injectable } from '@nestjs/common';
import { Payment } from 'src/infrastructure/types/portone.types';
import { Payment as DomainPayment } from 'src/domain/types/payments/payment.types';
import { PaymentProductTypesEnum } from 'src/domain/types/payment-products/payment-product.types';

@Injectable()
export class PortOnePaymentMapper {
    static toDomain(data: Payment): DomainPayment {
        return {
            paymentId: data.id,
            productId: data.customData.productId,
            userId: data.customData.userId,
            totalPrice: data.amount.total,
            productType: PaymentProductTypesEnum[data.customData.productType],
            paymentMethod: data.method.type,
            paymentMethodDetail: data.method.provider,
        };
    }
}

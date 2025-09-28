import { Module } from '@nestjs/common';
import { GoldChargeCompletionHandler } from 'src/domain/components/payments/gold-charge-completion-handler';
import { PaymentCompletionHandlerFactory } from 'src/domain/components/payments/payment-completion-handler-factory';
import { GoldChargePaymentProductComponentModule } from 'src/modules/payment-products/gold-charge-payment-product-component.module';
import { PaymentComponentModule } from 'src/modules/payments/payment-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';

@Module({
    imports: [
        GoldChargePaymentProductComponentModule,
        PaymentComponentModule,
        UserComponentModule,
    ],
    providers: [GoldChargeCompletionHandler, PaymentCompletionHandlerFactory],
    exports: [PaymentCompletionHandlerFactory],
})
export class PaymentCompletionHandlerFactoryModule {}

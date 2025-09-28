import { Module } from '@nestjs/common';
import { PaymentsService } from 'src/domain/services/payments/payments.service';
import { PortOneWebhookVerifier } from 'src/infrastructure/payment/port-one-webhook-verifier';
import { GoldChargePaymentProductComponentModule } from 'src/modules/payment-products/gold-charge-payment-product-component.module';
import { PaymentCompletionHandlerFactoryModule } from 'src/modules/payments/payment-completion-handler-factory.module';
import { PaymentComponentModule } from 'src/modules/payments/payment-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';
import { PaymentsController } from 'src/presentation/controller/payments/payments.controller';

@Module({
    imports: [
        GoldChargePaymentProductComponentModule,
        UserComponentModule,
        PaymentCompletionHandlerFactoryModule,
        PaymentComponentModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, PortOneWebhookVerifier],
})
export class PaymentsModule {}

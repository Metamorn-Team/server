import { Module } from '@nestjs/common';
import { GoldChargePaymentProductComponentModule } from 'src/modules/payment-products/gold-charge-payment-product-component.module';
import { PaymentProductsController } from 'src/presentation/payment-products/payment-products.controller';

@Module({
    imports: [GoldChargePaymentProductComponentModule],
    controllers: [PaymentProductsController],
})
export class PaymentProductsModule {}

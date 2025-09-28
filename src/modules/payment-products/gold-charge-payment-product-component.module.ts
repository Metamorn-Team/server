import { Module } from '@nestjs/common';
import { GoldChargePaymentProductReader } from 'src/domain/components/payment-products/gold-charge-payment-product-reader';
import { GoldChargePaymentProductRepository } from 'src/domain/interface/gold-charge-payment-product.repository';
import { GoldChargePaymentProductPrismaRepository } from 'src/infrastructure/repositories/gold-charge-payment-product-prisma.repository';

@Module({
    providers: [
        {
            provide: GoldChargePaymentProductRepository,
            useClass: GoldChargePaymentProductPrismaRepository,
        },
        GoldChargePaymentProductReader,
    ],
    exports: [GoldChargePaymentProductReader],
})
export class GoldChargePaymentProductComponentModule {}

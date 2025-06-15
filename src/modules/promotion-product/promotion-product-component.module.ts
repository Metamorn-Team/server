import { Module } from '@nestjs/common';
import { PromotionProductReader } from 'src/domain/components/promotion-product/promotion-product-reader';
import { PromotionProductRepository } from 'src/domain/interface/promotion-product.repository';
import { PromotionProductPrismaRepository } from 'src/infrastructure/repositories/promotion-product-prisma.repository';

@Module({
    providers: [
        PromotionProductReader,
        {
            provide: PromotionProductRepository,
            useClass: PromotionProductPrismaRepository,
        },
    ],
    exports: [PromotionProductReader],
})
export class PromotionProductComponentModule {}

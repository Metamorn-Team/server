import { Module } from '@nestjs/common';
import { PromotionProductComponentModule } from 'src/modules/promotion-product/promotion-product-component.module';
import { PromotionProductController } from 'src/presentation/controller/promotion-product/promotion-product.controller';

@Module({
    imports: [PromotionProductComponentModule],
    controllers: [PromotionProductController],
})
export class PromotionProductModule {}

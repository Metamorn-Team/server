import { Module } from '@nestjs/common';
import { PromotionComponentModule } from 'src/modules/promotions/promotion-component.module';
import { PromotionController } from 'src/presentation/controller/promotions/promotion.controller';

@Module({
    imports: [PromotionComponentModule],
    controllers: [PromotionController],
})
export class PromotionModule {}

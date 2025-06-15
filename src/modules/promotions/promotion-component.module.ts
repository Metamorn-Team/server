import { Module } from '@nestjs/common';
import { PromotionReader } from 'src/domain/components/promotions/promotion-reader';
import { PromotionRepository } from 'src/domain/interface/promotion.repository';
import { PromotionPrismaRepository } from 'src/infrastructure/repositories/promotion-prisma.repository';

@Module({
    providers: [
        PromotionReader,
        { provide: PromotionRepository, useClass: PromotionPrismaRepository },
    ],
    exports: [PromotionReader],
})
export class PromotionComponentModule {}

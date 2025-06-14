import { Inject, Injectable } from '@nestjs/common';
import { PromotionProductRepository } from 'src/domain/interface/promotion-product.repository';

@Injectable()
export class PromotionProductReader {
    constructor(
        @Inject(PromotionProductRepository)
        private readonly promotionProductRepository: PromotionProductRepository,
    ) {}

    async readManyForCalc(productIds: string[]) {
        return await this.promotionProductRepository.findByProductIds(
            productIds,
        );
    }
}

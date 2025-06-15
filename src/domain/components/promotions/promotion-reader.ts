import { Inject, Injectable } from '@nestjs/common';
import { PromotionRepository } from 'src/domain/interface/promotion.repository';

@Injectable()
export class PromotionReader {
    constructor(
        @Inject(PromotionRepository)
        private readonly promotionRepository: PromotionRepository,
    ) {}

    async readAll(now = new Date()) {
        return await this.promotionRepository.findAll(now);
    }
}

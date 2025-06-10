import { PromotionType } from 'src/domain/types/promotion.types';

export class PromotionEntity {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly type: PromotionType,
        readonly description: string,
        readonly startedAt: Date,
        readonly endedAt: Date,
    ) {}
}

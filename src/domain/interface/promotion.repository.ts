import { Promotion } from 'src/domain/types/promotion.types';

export interface PromotionRepository {
    findAll(now: Date): Promise<Promotion[]>;
}

export const PromotionRepository = Symbol('PromotionRepository');

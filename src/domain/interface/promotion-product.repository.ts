import { PromotionForCalc } from 'src/domain/types/promotion-product.types';

export interface PromotionProductRepository {
    findByProductIds(productIds: string[]): Promise<PromotionForCalc[]>;
}

export const PromotionProductRepository = Symbol('PromotionProductRepository');

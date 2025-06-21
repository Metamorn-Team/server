import { Product, ProductOrderBy, Sort } from 'src/domain/types/product.types';
import { PromotionForCalc } from 'src/domain/types/promotion-product.types';

export interface PromotionProductRepository {
    findByProductIds(
        productIds: string[],
        now?: Date,
    ): Promise<PromotionForCalc[]>;
    findByPromotion(
        userId: string,
        name: string,
        page: number,
        limit: number,
        orderBy: ProductOrderBy,
        sort: Sort,
    ): Promise<{ product: Product; promotion: PromotionForCalc }[]>;
    countByPromotion(name: string): Promise<number>;
}

export const PromotionProductRepository = Symbol('PromotionProductRepository');

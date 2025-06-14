import { ItemGrade } from 'src/domain/types/item.types';
import { Product, PurchasedStatus } from 'src/domain/types/product.types';
import { PromotionForCalc } from 'src/domain/types/promotion-product.types';

export class ProductWithPromotion {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly coverImage: string;
    readonly type: string;
    readonly key: string;
    readonly grade: ItemGrade;
    readonly purchasedStatus: PurchasedStatus;

    readonly originPrice: number;
    readonly saledPrice: number | null;
    readonly discountRate: number | null;
    readonly promotionName: string | null;

    private constructor(params: ProductWithPromotion) {
        Object.assign(this, params);
    }

    static from(
        product: Product,
        promotion?: PromotionForCalc,
    ): ProductWithPromotion {
        const { price, ...productData } = product;

        const originPrice = price;
        // discountRate가 0일 수도 있음
        const discountRate = promotion?.discountRate ?? null;
        const saledPrice =
            discountRate !== null
                ? Math.floor(originPrice * (1 - discountRate))
                : null;

        return new ProductWithPromotion({
            ...productData,
            originPrice,
            saledPrice,
            discountRate,
            promotionName: promotion?.promotionName ?? null,
        });
    }
}

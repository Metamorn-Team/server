export interface PromotionForCalc {
    readonly promotionId: string;
    readonly promotionName: string;
    readonly productId: string;
    readonly discountRate: number | null;
}

export type PromotionMap = Record<string, PromotionForCalc>;

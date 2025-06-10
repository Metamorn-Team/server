export const promotionTypes = ['LAUNCH'] as const;
export type PromotionType = (typeof promotionTypes)[number];

export interface Promotion {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly description: string | null;
}

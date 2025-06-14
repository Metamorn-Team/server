export const promotionTypes = ['LAUNCH'] as const;
export type PromotionType = (typeof promotionTypes)[number];
export enum PromotionTypeEnum {
    LAUNCH,
}
export const convertNumberToPromotionType = (num: number) =>
    promotionTypes[num];

export interface Promotion {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly description: string | null;
}

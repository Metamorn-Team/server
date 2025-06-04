export const goldTransactionTypes = ['PAYMENT', 'PURCHASE', 'REFUND'] as const;
export type GoldTransactionType = (typeof goldTransactionTypes)[number];
export enum GoldTransactionTypeEnum {
    PAYMENT,
    PURCHASE,
    REFUND,
}

export const convertNumberToGoldTransactionType = (
    type: number,
): GoldTransactionType => goldTransactionTypes[type];

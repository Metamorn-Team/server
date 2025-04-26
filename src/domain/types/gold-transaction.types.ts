export const goldTransactionTypes = ['PAYMENT', 'PURCHASE', 'REFUND'] as const;
export type GoldTransactionType = (typeof goldTransactionTypes)[number];
export enum GoldTransactionTypeEnum {
    PAYMENT,
    PURCHASE,
    REFUND,
}

export const convertNumberToGoldTransactionType = (
    type: number,
): GoldTransactionType => {
    switch (type) {
        case 0:
            return 'PAYMENT';
        case 1:
            return 'PURCHASE';
        case 2:
            return 'REFUND';
        default:
            return 'PAYMENT';
    }
};

export const purchaseStatus = ['COMPLETE', 'REFUND'] as const;
export type PurchaseStatus = (typeof purchaseStatus)[number];
export enum PurchaseStatusEnum {
    COMPLETE,
    REFUND,
}

export const convertNumberToPurchaseStatus = (
    status: number,
): PurchaseStatus => {
    switch (status) {
        case 0:
            return 'COMPLETE';
        case 1:
            return 'REFUND';
        default:
            return 'COMPLETE';
    }
};

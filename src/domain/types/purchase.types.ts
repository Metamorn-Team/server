export const purchaseStatus = ['COMPLETE', 'REFUND'] as const;
export type PurchaseStatus = (typeof purchaseStatus)[number];
export enum PurchaseStatusEnum {
    COMPLETE,
    REFUND,
}

export const convertNumberToPurchaseStatus = (status: number): PurchaseStatus =>
    purchaseStatus[status];

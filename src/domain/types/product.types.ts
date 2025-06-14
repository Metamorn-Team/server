import { ItemGrade } from 'src/domain/types/item.types';

export const purchasedStatus = ['PURCHASED', 'NONE'] as const;
export type PurchasedStatus = (typeof purchasedStatus)[number];

export interface ProductForPurchase {
    readonly id: string;
    readonly originPrice: number;
    readonly discountRate: number | null;
    readonly itemId: string;
}

export interface Product {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly coverImage: string;
    readonly type: string;
    readonly key: string;
    readonly grade: ItemGrade;
    readonly purchasedStatus: PurchasedStatus;
}

export const productTypes = ['AURA', 'SPEECH_BUBBLE'] as const;
export type ProductType = (typeof productTypes)[number];
export enum ProductTypeEnum {
    AURA,
    SPEECH_BUBBLE,
}
export const convertNumberToProductType = (type: number) => productTypes[type];

export enum ProductOrder {
    LATEST = 'latest',
    PRICIEST = 'priciest',
    CHEAPEST = 'cheapest',
}

export enum ProductOrderBy {
    CREATEDAT = 'createdAt',
    PRICE = 'price',
}

export enum Sort {
    DESC = 'desc',
    ASC = 'asc',
}

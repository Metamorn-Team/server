import { ItemGrade } from 'src/domain/types/item.types';

export const purchasedStatus = ['PURCHASED', 'NONE'] as const;
export type PurchasedStatus = (typeof purchasedStatus)[number];

export interface ProductForPurchase {
    readonly id: string;
    readonly price: number;
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

export enum ProductType {
    AURA = 'aura',
}

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

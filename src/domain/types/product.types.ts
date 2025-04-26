export interface Product {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly coverImage: string;
    readonly type: string;
    readonly key: string;
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

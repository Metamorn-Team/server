export interface Product {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly coverImage: string;
}

export enum ProductCategory {
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

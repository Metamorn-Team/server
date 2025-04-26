import {
    ProductOrderBy,
    Product,
    Sort,
    ProductForPurchase,
} from 'src/domain/types/product.types';

export interface ProductRepository {
    findByCategory(
        type: string,
        page: number,
        limit: number,
        orderBy: ProductOrderBy,
        sort: Sort,
    ): Promise<Product[]>;

    findByIds(ids: string[]): Promise<ProductForPurchase[]>;

    countByType(type: string): Promise<number>;
}

export const ProductRepository = Symbol('ProductRepository');

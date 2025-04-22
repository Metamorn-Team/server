import { ProductOrderBy, Product, Sort } from 'src/domain/types/product.types';

export interface ProductRepository {
    findByCategory(
        categoryId: string,
        page: number,
        limit: number,
        orderBy: ProductOrderBy,
        sort: Sort,
    ): Promise<Product[]>;
}

export const ProductRepository = Symbol('ProductRepository');

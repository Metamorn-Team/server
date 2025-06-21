import { ItemTypeEnum } from 'src/domain/types/item.types';
import {
    ProductOrderBy,
    Product,
    Sort,
    ProductForPurchase,
    ProductTypeEnum,
} from 'src/domain/types/product.types';

export interface ProductRepository {
    findByType(
        userId: string,
        type: ProductTypeEnum,
        page: number,
        limit: number,
        orderBy: ProductOrderBy,
        sort: Sort,
    ): Promise<Product[]>;

    findByIdsForPurchase(
        ids: string[],
        now?: Date,
    ): Promise<ProductForPurchase[]>;

    countByType(type: ItemTypeEnum): Promise<number>;
}

export const ProductRepository = Symbol('ProductRepository');

import { ProductCategory } from 'src/domain/types/product-category';

export interface ProductCategoryRepository {
    findAll(): Promise<ProductCategory[]>;
}

export const ProductCategoryRepository = Symbol('ProductCategoryRepository');

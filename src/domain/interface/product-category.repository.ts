import { ProductCategory } from 'src/domain/types/product-category.types';

export interface ProductCategoryRepository {
    findAll(): Promise<ProductCategory[]>;
    findOneByName(name: string): Promise<ProductCategory | null>;
}

export const ProductCategoryRepository = Symbol('ProductCategoryRepository');

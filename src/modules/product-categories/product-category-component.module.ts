import { Module } from '@nestjs/common';
import { ProductCategoryReader } from 'src/domain/components/product-categories/product-category-reader';
import { ProductCategoryRepository } from 'src/domain/interface/product-category.repository';
import { ProductCategoryPrismaRepository } from 'src/infrastructure/repositories/product-category-prisma.repository';

@Module({
    providers: [
        ProductCategoryReader,
        {
            provide: ProductCategoryRepository,
            useClass: ProductCategoryPrismaRepository,
        },
    ],
    exports: [ProductCategoryReader],
})
export class ProductCategoryComponentModule {}

import { Module } from '@nestjs/common';
import { ProductCategoryComponentModule } from 'src/modules/product-categories/product-category-component.module';
import { ProductCategoryController } from 'src/presentation/controller/product-categories/product-category.controller';

@Module({
    imports: [ProductCategoryComponentModule],
    controllers: [ProductCategoryController],
})
export class ProductCategoryModule {}

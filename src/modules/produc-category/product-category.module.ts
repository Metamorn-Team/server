import { Module } from '@nestjs/common';
import { ProductCategoryComponentModule } from 'src/modules/produc-category/product-category-component.module';
import { ProductCategoryController } from 'src/presentation/controller/product-category/product-category.controller';

@Module({
    imports: [ProductCategoryComponentModule],
    controllers: [ProductCategoryController],
})
export class ProductCategoryModule {}

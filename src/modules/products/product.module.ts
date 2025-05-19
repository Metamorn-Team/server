import { Module } from '@nestjs/common';
import { ProductCategoryComponentModule } from 'src/modules/product-categories/product-category-component.module';
import { ProductComponentModule } from 'src/modules/products/product-component.module';
import { ProductController } from 'src/presentation/controller/products/product.controller';

@Module({
    imports: [ProductComponentModule, ProductCategoryComponentModule],
    controllers: [ProductController],
})
export class ProductModule {}

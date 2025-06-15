import { Module } from '@nestjs/common';
import { ProductService } from 'src/domain/services/product/product.service';
import { ProductCategoryComponentModule } from 'src/modules/product-categories/product-category-component.module';
import { ProductComponentModule } from 'src/modules/products/product-component.module';
import { PromotionProductComponentModule } from 'src/modules/promotion-product/promotion-product-component.module';
import { ProductController } from 'src/presentation/controller/products/product.controller';

@Module({
    imports: [
        ProductComponentModule,
        ProductCategoryComponentModule,
        PromotionProductComponentModule,
    ],
    providers: [ProductService],
    controllers: [ProductController],
})
export class ProductModule {}

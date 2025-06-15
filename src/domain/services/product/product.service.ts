import { Injectable } from '@nestjs/common';
import { ProductReader } from 'src/domain/components/products/product-reader';
import { PromotionProductReader } from 'src/domain/components/promotion-product/promotion-product-reader';
import { ProductType } from 'src/domain/types/product.types';
import { ProductWithPromotion } from 'src/domain/types/product/product-with-promotion';
import { PromotionMap } from 'src/domain/types/promotion-product.types';
import { ProductOrder } from 'src/presentation/dto/shared';

@Injectable()
export class ProductService {
    constructor(
        private readonly productReader: ProductReader,
        private readonly promotionProductReader: PromotionProductReader,
    ) {}

    async getProducts(
        userId: string,
        type: ProductType,
        order: ProductOrder,
        page: number,
        limit: number,
    ): Promise<ProductWithPromotion[]> {
        const products = await this.productReader.read(
            userId,
            type,
            order,
            page,
            limit,
        );
        const promotions = await this.promotionProductReader.readManyForCalc(
            products.map((p) => p.id),
        );

        const promotionMap: PromotionMap = {};
        for (const promo of promotions) {
            promotionMap[promo.productId] = promo;
        }

        return products.map((product) =>
            ProductWithPromotion.from(product, promotionMap[product.id]),
        );
    }
}

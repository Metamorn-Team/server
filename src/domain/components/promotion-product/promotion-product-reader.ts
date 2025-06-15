import { Inject, Injectable } from '@nestjs/common';
import { PromotionProductRepository } from 'src/domain/interface/promotion-product.repository';
import {
    ProductOrder,
    ProductOrderBy,
    Sort,
} from 'src/domain/types/product.types';
import { ProductWithPromotion } from 'src/domain/types/product/product-with-promotion';

@Injectable()
export class PromotionProductReader {
    constructor(
        @Inject(PromotionProductRepository)
        private readonly promotionProductRepository: PromotionProductRepository,
    ) {}

    async readManyForCalc(productIds: string[]) {
        return await this.promotionProductRepository.findByProductIds(
            productIds,
        );
    }

    async readProducts(
        userId: string,
        name: string,
        order: ProductOrder,
        page: number,
        limit: number,
    ) {
        let orderBy = ProductOrderBy.CREATEDAT;
        let sort = Sort.DESC;

        if (order === ProductOrder.LATEST) {
            orderBy = ProductOrderBy.CREATEDAT;
            sort = Sort.DESC;
        }

        if (order === ProductOrder.CHEAPEST) {
            orderBy = ProductOrderBy.PRICE;
            sort = Sort.ASC;
        }

        if (order === ProductOrder.PRICIEST) {
            orderBy = ProductOrderBy.PRICE;
            sort = Sort.DESC;
        }

        const products = await this.promotionProductRepository.findByPromotion(
            userId,
            name,
            page,
            limit,
            orderBy,
            sort,
        );

        return products.map((p) =>
            ProductWithPromotion.from(p.product, p.promotion),
        );
    }

    async countByPromotion(name: string) {
        return await this.promotionProductRepository.countByPromotion(name);
    }
}

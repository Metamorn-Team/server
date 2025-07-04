import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/domain/interface/product.repository';
import { ItemType, ItemTypeEnum } from 'src/domain/types/item.types';
import {
    ProductOrder,
    ProductOrderBy,
    ProductType,
    ProductTypeEnum,
    Sort,
} from 'src/domain/types/product.types';

@Injectable()
export class ProductReader {
    constructor(
        @Inject(ProductRepository)
        private readonly productRepository: ProductRepository,
    ) {}

    async read(
        userId: string,
        type: ProductType,
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

        return await this.productRepository.findByType(
            userId,
            ProductTypeEnum[type],
            page,
            limit,
            orderBy,
            sort,
        );
    }

    async readByIdsForPurchase(ids: string[]) {
        return await this.productRepository.findByIdsForPurchase(ids);
    }

    async count(type: ItemType) {
        return await this.productRepository.countByType(ItemTypeEnum[type]);
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/domain/interface/product.repository';
import { ProductOrder, ProductOrderBy, Sort } from 'src/domain/types/product';

@Injectable()
export class ProductReader {
    constructor(
        @Inject(ProductRepository)
        private readonly productRepository: ProductRepository,
    ) {}

    async read(
        categoryId: string,
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

        return await this.productRepository.findByCategory(
            categoryId,
            page,
            limit,
            orderBy,
            sort,
        );
    }
}

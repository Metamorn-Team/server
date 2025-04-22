import { Inject, Injectable } from '@nestjs/common';
import { ProductCategoryRepository } from 'src/domain/interface/product-category.repository';

@Injectable()
export class ProductCategoryReader {
    constructor(
        @Inject(ProductCategoryRepository)
        private readonly productCategoryRepository: ProductCategoryRepository,
    ) {}

    async readAll() {
        return await this.productCategoryRepository.findAll();
    }
}

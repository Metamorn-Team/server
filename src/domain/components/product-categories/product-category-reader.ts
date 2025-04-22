import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
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

    async readOneByName(name: string) {
        const category =
            await this.productCategoryRepository.findOneByName(name);

        if (!category) {
            throw new DomainException(
                DomainExceptionType.ProductCategoryNotFound,
                HttpStatus.NOT_FOUND,
            );
        }

        return category;
    }
}

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PAYMENT_PRODUCT_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { GoldChargePaymentProductRepository } from 'src/domain/interface/gold-charge-payment-product.repository';

@Injectable()
export class GoldChargePaymentProductReader {
    constructor(
        @Inject(GoldChargePaymentProductRepository)
        private readonly goldChargePaymentProductRepository: GoldChargePaymentProductRepository,
    ) {}

    async readAll() {
        return await this.goldChargePaymentProductRepository.findAll();
    }

    async readOne(id: string) {
        const product =
            await this.goldChargePaymentProductRepository.findOneById(id);
        if (!product)
            throw new DomainException(
                DomainExceptionType.PAYMENT_PRODUCT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                PAYMENT_PRODUCT_NOT_FOUND_MESSAGE(id),
            );

        return product;
    }
}

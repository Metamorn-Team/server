import { Inject, Injectable } from '@nestjs/common';
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
}

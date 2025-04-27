import { Inject, Injectable } from '@nestjs/common';
import { PurchaseRepository } from 'src/domain/interface/purchase.repository';

@Injectable()
export class PurchaseReader {
    constructor(
        @Inject(PurchaseRepository)
        private readonly purchaseRepository: PurchaseRepository,
    ) {}

    async hasAnyPurchased(userId: string, productIds: string[]) {
        return await this.purchaseRepository.hasAnyPurchased(
            userId,
            productIds,
        );
    }
}

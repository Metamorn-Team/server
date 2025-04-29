import { Inject, Injectable } from '@nestjs/common';
import { PurchaseEntity } from 'src/domain/entities/purchase/purchase.entity';
import { PurchaseRepository } from 'src/domain/interface/purchase.repository';

@Injectable()
export class PurchaseWriter {
    constructor(
        @Inject(PurchaseRepository)
        private readonly purchaseRepository: PurchaseRepository,
    ) {}

    async createMany(purchases: PurchaseEntity[]) {
        await this.purchaseRepository.saveMany(purchases);
    }
}

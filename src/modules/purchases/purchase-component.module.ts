import { Module } from '@nestjs/common';
import { PurchaseWriter } from 'src/domain/components/purchases/purchase-writer';
import { PurchaseRepository } from 'src/domain/interface/purchase.repository';
import { PurchasePrismaRepository } from 'src/infrastructure/repositories/purchase-prisma.repository';

@Module({
    providers: [
        PurchaseWriter,
        { provide: PurchaseRepository, useClass: PurchasePrismaRepository },
    ],
    exports: [PurchaseWriter],
})
export class PurchaseComponentModule {}

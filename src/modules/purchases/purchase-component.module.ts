import { Module } from '@nestjs/common';
import { PurchaseReader } from 'src/domain/components/purchases/purchase-reader';
import { PurchaseWriter } from 'src/domain/components/purchases/purchase-writer';
import { PurchaseRepository } from 'src/domain/interface/purchase.repository';
import { PurchasePrismaRepository } from 'src/infrastructure/repositories/purchase-prisma.repository';

@Module({
    providers: [
        PurchaseReader,
        PurchaseWriter,
        { provide: PurchaseRepository, useClass: PurchasePrismaRepository },
    ],
    exports: [PurchaseReader, PurchaseWriter],
})
export class PurchaseComponentModule {}

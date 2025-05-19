import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PurchaseEntity } from 'src/domain/entities/purchase/purchase.entity';
import { PurchaseRepository } from 'src/domain/interface/purchase.repository';
import { PurchaseStatusEnum } from 'src/domain/types/purchase.types';

@Injectable()
export class PurchasePrismaRepository implements PurchaseRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async save(data: PurchaseEntity): Promise<void> {
        await this.txHost.tx.purchase.create({ data });
    }

    async saveMany(data: PurchaseEntity[]): Promise<void> {
        await this.txHost.tx.purchase.createMany({ data });
    }

    async hasAnyPurchased(
        userId: string,
        productIds: string[],
    ): Promise<boolean> {
        const count = await this.txHost.tx.purchase.count({
            where: {
                userId,
                status: PurchaseStatusEnum.COMPLETE,
                productId: {
                    in: productIds,
                },
            },
        });
        return count > 0;
    }
}

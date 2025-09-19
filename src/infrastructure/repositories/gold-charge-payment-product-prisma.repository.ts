import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { GoldChargePaymentProductRepository } from 'src/domain/interface/gold-charge-payment-product.repository';

@Injectable()
export class GoldChargePaymentProductPrismaRepository
    implements GoldChargePaymentProductRepository
{
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async findAll(): Promise<any> {
        return await this.txHost.tx.goldChargePaymentProduct.findMany({
            select: {
                id: true,
                amount: true,
                price: true,
            },
            orderBy: {
                amount: 'asc',
            },
        });
    }

    async findOneById(id: string): Promise<any> {
        return await this.txHost.tx.goldChargePaymentProduct.findUnique({
            where: { id },
            select: {
                id: true,
                amount: true,
                price: true,
            },
        });
    }
}

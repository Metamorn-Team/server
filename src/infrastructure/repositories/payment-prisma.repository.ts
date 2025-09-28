import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PaymentEntity } from 'src/domain/entities/payments/payment.entity';
import { PaymentRepository } from 'src/domain/interface/payment.repository';
import {
    PaymentRecord,
    PaymentStatus,
    UpdatePaymentInput,
} from 'src/domain/types/payments/payment.types';

@Injectable()
export class PaymentPrismaRepository implements PaymentRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async save(data: PaymentEntity): Promise<void> {
        await this.txHost.tx.payment.create({
            data,
        });
    }

    async findOneByMerchantPaymentId(
        merchantPaymentId: string,
    ): Promise<PaymentRecord | null> {
        return await this.txHost.tx.payment.findUnique({
            where: { merchantPaymentId },
            select: {
                id: true,
                amount: true,
                currency: true,
                merchantPaymentId: true,
                paymentProductId: true,
                status: true,
                userId: true,
            },
        });
    }

    async update(id: string, data: UpdatePaymentInput): Promise<void> {
        await this.txHost.tx.payment.update({
            where: { id },
            data,
        });
    }

    async updateStatus(id: string, status: PaymentStatus): Promise<void> {
        await this.txHost.tx.payment.update({
            where: { id },
            data: { status },
        });
    }
}

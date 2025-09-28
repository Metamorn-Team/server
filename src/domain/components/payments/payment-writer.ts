import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import {
    PaymentEntity,
    PaymentPrototype,
} from 'src/domain/entities/payments/payment.entity';
import { PaymentRepository } from 'src/domain/interface/payment.repository';
import {
    CreatePendingPaymentInput,
    PaymentStatus,
    UpdatePaymentInput,
} from 'src/domain/types/payments/payment.types';

@Injectable()
export class PaymentWriter {
    constructor(
        @Inject(PaymentRepository)
        private readonly paymentRepository: PaymentRepository,
    ) {}

    async create(proto: PaymentPrototype) {
        const payment = PaymentEntity.create(proto, v4);
        await this.paymentRepository.save(payment);

        return payment;
    }

    async createPendingPayment(input: CreatePendingPaymentInput) {
        const payment = PaymentEntity.create(
            {
                ...input,
                status: 'PENDING',
                currency: 'KRW',
            },
            v4,
        );
        await this.paymentRepository.save(payment);

        return payment;
    }

    async updateStatus(id: string, status: PaymentStatus) {
        await this.paymentRepository.updateStatus(id, status);
    }

    async update(id: string, input: UpdatePaymentInput) {
        await this.paymentRepository.update(id, input);
    }
}

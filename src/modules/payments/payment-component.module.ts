import { Module } from '@nestjs/common';
import { PaymentReader } from 'src/domain/components/payments/payment-reader';
import { PaymentWriter } from 'src/domain/components/payments/payment-writer';
import { PaymentRepository } from 'src/domain/interface/payment.repository';
import { PaymentPrismaRepository } from 'src/infrastructure/repositories/payment-prisma.repository';

@Module({
    providers: [
        {
            provide: PaymentRepository,
            useClass: PaymentPrismaRepository,
        },
        PaymentReader,
        PaymentWriter,
    ],
    exports: [PaymentReader, PaymentWriter],
})
export class PaymentComponentModule {}

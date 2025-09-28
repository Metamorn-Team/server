import { ApiProperty } from '@nestjs/swagger';
import {
    paymentStatus,
    PaymentStatus,
} from '../../../../domain/types/payments/payment.types';

export class GetPaymentStatusResponse {
    @ApiProperty({ enum: paymentStatus, example: paymentStatus[1] })
    readonly status: PaymentStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import {
    PaymentProductTypes,
    paymentProductTypes,
} from 'src/domain/types/payment-products/payment-product.types';

export class CreatePaymentRequest {
    @ApiProperty({
        example: 'uuid',
        description: '결제사에 전송하는 식별 ID',
    })
    @IsUUID()
    merchantPaymentId: string;

    @ApiProperty({
        example: 'GOLD_CHARGE',
        description: '상품 타입',
        enum: paymentProductTypes,
    })
    @IsEnum(paymentProductTypes)
    type: PaymentProductTypes;

    @ApiProperty({ example: 'uuid', description: '결제 상품 ID' })
    @IsUUID()
    paymentProductId: string;

    @ApiProperty({ example: 10000, description: '결제 금액' })
    @IsNumber()
    amount: number;
}

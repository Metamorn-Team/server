import { ApiProperty } from '@nestjs/swagger';

export class GoldChargePaymentProductItem {
    @ApiProperty({ description: '상품 ID', example: 'uuid' })
    readonly id: string;

    @ApiProperty({ description: '충전 골드 량', example: 500 })
    readonly amount: number;

    @ApiProperty({ description: '상품 가격', example: 5500 })
    readonly price: number;
}

export class GoldChargePaymentProductListResponse {
    @ApiProperty({
        type: [GoldChargePaymentProductItem],
        description: '골드 충전 상품 리스트',
    })
    readonly products: GoldChargePaymentProductItem[];
}

import { Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { GoldChargePaymentProductReader } from 'src/domain/components/payment-products/gold-charge-payment-product-reader';
import { GoldChargePaymentProductListResponse } from 'src/presentation/dto/payment-products/response/gold-charge-payment-product-list.response';

@LivislandController('payment-products')
export class PaymentProductsController {
    constructor(
        private readonly goldChargePaymentProductReader: GoldChargePaymentProductReader,
    ) {}

    @ApiOperation({ summary: '골드 충전 상품 전체 조회' })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: [GoldChargePaymentProductListResponse],
    })
    @Get('gold-charge')
    async getAllGoldChargeProducts(): Promise<GoldChargePaymentProductListResponse> {
        const products = await this.goldChargePaymentProductReader.readAll();
        return { products };
    }
}

import { Body, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { PurchaseService } from 'src/domain/services/purchases/purchase.service';
import { PurchaseRequest } from 'src/presentation/dto/purchases/request/puchase.request';

@LivislandController('purchases')
export class PurchaseController {
    constructor(private readonly purchaseService: PurchaseService) {}

    @ApiOperation({
        summary: '상품 구매',
        description: '한 번에 최대 20개 구매 가능 (임시 개수)',
    })
    @ApiResponse({
        status: 201,
        description: '구매 성공',
    })
    @ApiResponse({
        status: 422,
        description: '골드 잔액 부족',
    })
    @ApiResponse({
        status: 404,
        description: '구매하려는 상품 중 존재하지 않는 상품이 있는 경우',
    })
    @ApiResponse({
        status: 409,
        description: '구매하려는 상품의 구매 횟수를 초과한 경우',
    })
    @Post()
    async purchase(
        @Body() dto: PurchaseRequest,
        @CurrentUser() userId: string,
    ) {
        await this.purchaseService.purchase(userId, dto.productIds);
    }
}

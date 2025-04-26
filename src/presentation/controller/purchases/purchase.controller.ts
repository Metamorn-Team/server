import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { PurchaseService } from 'src/domain/services/purchases/purchase.service';
import { PurchaseRequest } from 'src/presentation/dto/purchases/request/puchase.request';

@ApiTags('purchases')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('purchases')
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
    @Post()
    async purchase(
        @Body() dto: PurchaseRequest,
        @CurrentUser() userId: string,
    ) {
        await this.purchaseService.purchase(userId, dto.productIds);
    }
}

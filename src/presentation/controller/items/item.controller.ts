import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserOwnedItemReader } from 'src/domain/components/user-owned-items/user-owned-item-reader';
import { GetOwnedItemListRequest } from 'src/presentation/dto/items/request/get-owned-item-list.request';
import { GetOwnedItemListResponse } from 'src/presentation/dto/items/response/get-owned-item-list.response';

@ApiTags('items')
@ApiResponse({ status: 400, description: '잘못된 요청' })
@ApiResponse({ status: 401, description: '인증 실패 (토큰 누락 또는 만료)' })
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
@Controller('items')
export class ItemController {
    constructor(private readonly userOwnedItemReader: UserOwnedItemReader) {}

    @ApiOperation({
        summary: '소유하고 있는 모든 아이템 조회 (타입, 등급 별)',
    })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetOwnedItemListResponse,
    })
    @Get('owned')
    async getAllOwnedItems(
        @CurrentUser() userId: string,
        @Query() dto: GetOwnedItemListRequest,
    ): Promise<GetOwnedItemListResponse> {
        const { type, grade } = dto;
        const items = await this.userOwnedItemReader.readAll(
            userId,
            type,
            grade,
        );

        return { items };
    }
}

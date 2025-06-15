import { Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { UserOwnedItemReader } from 'src/domain/components/user-owned-items/user-owned-item-reader';
import { GetOwnedItemListRequest } from 'src/presentation/dto/items/request/get-owned-item-list.request';
import { GetOwnedItemListResponse } from 'src/presentation/dto/items/response/get-owned-item-list.response';

@LivislandController('items')
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

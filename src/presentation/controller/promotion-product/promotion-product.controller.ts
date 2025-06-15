import { Get, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { PromotionProductReader } from 'src/domain/components/promotion-product/promotion-product-reader';
import { GetPromotionProductListRequest } from 'src/presentation/dto/promotion-product/request/get-promotion-product-list.request';
import { GetProductListResponseV2 } from 'types';

@LivislandController('promotion-products')
export class PromotionProductController {
    constructor(
        private readonly promotionProductReader: PromotionProductReader,
    ) {}

    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetProductListResponseV2,
    })
    @Get()
    async getPromotionProducts(
        @Query() dto: GetPromotionProductListRequest,
        @CurrentUser() userId: string,
    ): Promise<GetProductListResponseV2> {
        const { name, order, page, limit } = dto;

        const products = await this.promotionProductReader.readProducts(
            userId,
            name,
            order,
            page,
            limit,
        );
        const count = await this.promotionProductReader.countByPromotion(name);

        return {
            products,
            count,
        };
    }
}

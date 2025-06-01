import { Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { ProductCategoryReader } from 'src/domain/components/product-categories/product-category-reader';
import { ProductReader } from 'src/domain/components/products/product-reader';
import { GetProductListRequest } from 'src/presentation/dto/product/request/get-product-list.request';
import { GetProductListResponse } from 'src/presentation/dto/product/response/get-product-list.response';

@LivislandController('products')
export class ProductController {
    constructor(
        private readonly productReader: ProductReader,
        private readonly productCategory: ProductCategoryReader,
    ) {}

    @ApiOperation({ summary: '상품 목록 조회' })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetProductListResponse,
    })
    @Get()
    async getProducts(
        @Query() dto: GetProductListRequest,
        @CurrentUser() userId: string,
    ): Promise<GetProductListResponse> {
        const { type, order, page, limit } = dto;

        const products = await this.productReader.read(
            userId,
            type,
            order,
            page,
            limit,
        );
        const count = page === 1 ? await this.productReader.count(type) : null;

        return { count, products };
    }
}

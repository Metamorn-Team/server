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
import { ProductCategoryReader } from 'src/domain/components/product-categories/product-category-reader';
import { ProductReader } from 'src/domain/components/products/product-reader';
import { GetProductListRequest } from 'src/presentation/dto/product/request/get-product-list.request';
import { GetProductListResponse } from 'src/presentation/dto/product/response/get-product-list.response';

@ApiTags('products')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
@Controller('products')
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

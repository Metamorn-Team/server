import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ProductCategoryReader } from 'src/domain/components/product-categories/product-category-reader';
import { ProductReader } from 'src/domain/components/products/product-reader';
import { GetProductListRequest } from 'src/presentation/dto/product/request/get-product-list.request';
import { GetProductListResponse } from 'src/presentation/dto/product/response/get-product-list.response';

@ApiTags('products')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
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
    ): Promise<GetProductListResponse> {
        const { category: categoryName, order, page, limit } = dto;

        const category = await this.productCategory.readOneByName(categoryName);
        const products = await this.productReader.read(
            category.id,
            order,
            page,
            limit,
        );

        return { products };
    }
}

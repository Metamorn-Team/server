import { Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { ProductReader } from 'src/domain/components/products/product-reader';
import { ProductService } from 'src/domain/services/product/product.service';
import { GetProductListRequest } from 'src/presentation/dto/product/request/get-product-list.request';
import { GetProductListResponseV2 } from 'src/presentation/dto/product/response/get-product-list-response-v2';
import { GetProductListResponse } from 'src/presentation/dto/product/response/get-product-list.response';

@LivislandController('products')
export class ProductController {
    constructor(
        private readonly productReader: ProductReader,
        private readonly productService: ProductService,
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

    @ApiOperation({ summary: '상품 목록 조회' })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: GetProductListResponseV2,
    })
    @Get('v2')
    async getProductsV2(
        @Query() dto: GetProductListRequest,
        @CurrentUser() userId: string,
    ): Promise<GetProductListResponseV2> {
        const { type, order, page, limit } = dto;

        const products = await this.productService.getProducts(
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

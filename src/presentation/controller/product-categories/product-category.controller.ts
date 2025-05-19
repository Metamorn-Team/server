import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ProductCategoryReader } from 'src/domain/components/product-categories/product-category-reader';
import { ProductCategoryItem } from 'src/presentation/dto/product-categories/response/get-all-product-categories.response';

@ApiTags('product-categories')
@ApiResponse({ status: 400, description: '잘못된 요청 데이터 형식' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
@Controller('product-categories')
export class ProductCategoryController {
    constructor(
        private readonly productCategoryReader: ProductCategoryReader,
    ) {}

    @ApiOperation({ summary: '상품 카테고리 전체 조회' })
    @ApiResponse({
        status: 200,
        description: '조회 성공',
        type: [ProductCategoryItem],
    })
    @Get()
    async getAll(): Promise<ProductCategoryItem[]> {
        return await this.productCategoryReader.readAll();
    }
}

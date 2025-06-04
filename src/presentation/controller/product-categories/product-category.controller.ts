import { Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LivislandController } from 'src/common/decorator/livisland-controller.decorator';
import { ProductCategoryReader } from 'src/domain/components/product-categories/product-category-reader';
import { ProductCategoryItem } from 'src/presentation/dto/product-categories/response/get-all-product-categories.response';

@LivislandController('product-categories')
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

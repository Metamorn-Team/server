import { ApiProperty } from '@nestjs/swagger';

class ProductItem {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: '멋진 오라' })
    readonly name: string;

    @ApiProperty({ example: '멋진 오라입니다.' })
    readonly description: string;

    @ApiProperty({ example: '3000' })
    readonly price: number;

    @ApiProperty({ example: 'https://image.com' })
    readonly coverImage: string;
}

export class GetProductListResponse {
    @ApiProperty({ type: [ProductItem] })
    readonly products: ProductItem[];
}

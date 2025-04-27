import { ApiProperty } from '@nestjs/swagger';
import { ItemGrade, itemGrades } from '../../../../domain/types/item.types';
import {
    purchasedStatus,
    PurchasedStatus,
} from '../../../../domain/types/product.types';

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

    @ApiProperty({ example: 'aura', description: '상품 타입' })
    readonly type: string;

    @ApiProperty({
        example: 'red_aura',
        description: '해당 상품을 식별하는 키',
    })
    readonly key: string;

    @ApiProperty({
        example: 'NORMAL',
        description: '판매하는 아이템의 등급',
        enum: itemGrades,
    })
    readonly grade: ItemGrade;

    @ApiProperty({
        example: 'NONE',
        description:
            '상품의 구매 여부 (현재 판매 예정 상품은 1회성 구매 상품 뿐)',
        enum: purchasedStatus,
    })
    readonly purchasedStatus: PurchasedStatus;
}

export class GetProductListResponse {
    @ApiProperty({
        nullable: true,
        example: 10,
        description: 'page가 1일 때 외에는 null',
    })
    readonly count: number | null;

    @ApiProperty({ type: [ProductItem] })
    readonly products: ProductItem[];
}

import { ApiProperty } from '@nestjs/swagger';
import { ItemGrade, itemGrades } from '../../../../domain/types/item.types';
import {
    purchasedStatus,
    PurchasedStatus,
} from '../../../../domain/types/product.types';

class ProductItemV2 {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: '멋진 오라' })
    readonly name: string;

    @ApiProperty({ example: '멋진 오라입니다.' })
    readonly description: string;

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

    @ApiProperty({ example: '3000', description: '원가' })
    readonly originPrice: number;

    @ApiProperty({
        example: '2700',
        description: '할인 적용시 할인가',
        nullable: true,
    })
    readonly saledPrice: number | null;

    @ApiProperty({
        example: '0.1',
        description: '0 ~ 1 (0% ~ 100%)',
        nullable: true,
    })
    readonly discountRate: number | null;

    @ApiProperty({
        example: '런칭 기념',
        description: '적용 중인 프로모션 이름',
        nullable: true,
    })
    readonly promotionName: string | null;
}

export class GetProductListResponseV2 {
    @ApiProperty({
        nullable: true,
        example: 10,
        description: 'page가 1일 때 외에는 null',
    })
    readonly count: number | null;

    @ApiProperty({ type: [ProductItemV2] })
    readonly products: ProductItemV2[];
}

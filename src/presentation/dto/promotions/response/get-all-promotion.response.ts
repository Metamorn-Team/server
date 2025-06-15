import { ApiProperty } from '@nestjs/swagger';
import { promotionTypes } from 'src/domain/types/promotion.types';

export class PromotionItem {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: '런칭 기념' })
    readonly name: string;

    @ApiProperty({
        example: 'LAUNCH',
        description: '프로모션 종류',
        enum: promotionTypes,
    })
    readonly type: string;

    @ApiProperty({ example: '런칭 기념 100% 할인 프로모션' })
    readonly description: string | null;
}

export class GetAllPromotionResponse {
    @ApiProperty({ type: [PromotionItem] })
    readonly promotions: PromotionItem[];
}

import { ApiProperty } from '@nestjs/swagger';
import {
    ItemGrade,
    itemGrades,
    ItemType,
    itemTypes,
} from '../../../../domain/types/item.types';

class Item {
    @ApiProperty({ example: 'uuid', description: '아이템 고유 ID' })
    readonly id: string;

    @ApiProperty({ example: '토마토 오라', description: '아이템 이름' })
    readonly name: string;

    @ApiProperty({
        example: '토마토 색의 오라.',
        description: '아이템 설명',
    })
    readonly description: string;

    @ApiProperty({
        enum: itemTypes,
        example: 'AURA',
        description: '아이템 타입 (예: AURA, SPEECH_BUBBLE 등)',
    })
    readonly type: ItemType;

    @ApiProperty({
        example: 'tomato_aura',
        description: '아이템 고유 키값',
    })
    readonly key: string;

    @ApiProperty({
        enum: itemGrades,
        example: 'RARE',
        description: '아이템 등급 (예: NORMAL, RARE 등)',
    })
    readonly grade: ItemGrade;
}

export class GetOwnedItemListResponse {
    @ApiProperty({
        type: [Item],
        description: '플레이어가 보유한 아이템 목록',
    })
    readonly items: Item[];
}

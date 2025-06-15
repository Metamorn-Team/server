import { ApiProperty } from '@nestjs/swagger';
import {
    ItemGrade,
    itemGrades,
    ItemType,
    itemTypes,
} from '../../../../domain/types/item.types';
import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetOwnedItemListRequest {
    @ApiProperty({
        enum: itemTypes,
        example: 'AURA',
        description: '아이템 타입',
    })
    @IsEnum(itemTypes)
    @Transform(({ value }) => String(value).toUpperCase())
    readonly type: ItemType;

    @ApiProperty({
        enum: itemGrades,
        example: 'RARE',
        description: '아이템 등급',
    })
    @IsEnum(itemGrades)
    @Transform(({ value }) => String(value).toUpperCase())
    readonly grade: ItemGrade;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsString, IsIn } from 'class-validator';
import {
    Order,
    sortBy,
    SortBy,
} from '../../../../domain/types/private-island.types';
import { Transform, Type } from 'class-transformer';

export class GetMyPrivateIslandRequest {
    @ApiPropertyOptional({
        description: '페이지당 항목 수',
        example: 20,
        minimum: 10,
        maximum: 20,
    })
    @Transform(({ value }) => (value ? Number(value) : 20))
    @IsOptional()
    @IsInt()
    @Min(10)
    readonly limit: number;

    @ApiProperty({
        description: '페이지 번호 (1부터 시작)',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly page: number;

    @ApiPropertyOptional({
        description: '정렬 기준 (createdAt 중 하나)',
        example: 'createdAt',
        enum: sortBy,
    })
    @IsString()
    @IsIn(sortBy)
    readonly sortBy: SortBy;

    @ApiPropertyOptional({
        description: '정렬 순서 (오름차순: asc, 내림차순: desc)',
        example: 'desc',
        enum: ['asc', 'desc'],
    })
    @IsString()
    @IsIn(['asc', 'desc'])
    readonly order: Order;
}

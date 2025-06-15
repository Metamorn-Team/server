import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Length, Max, Min } from 'class-validator';
import { ProductOrder } from '../../shared';
import { Type } from 'class-transformer';

export class GetPromotionProductListRequest {
    @ApiProperty({ example: '런칭기념' })
    @Length(1, 20)
    readonly name: string;

    @ApiProperty({ enum: ProductOrder })
    @IsEnum(ProductOrder)
    readonly order: ProductOrder;

    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly page: number;

    @ApiProperty({ example: 15 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(30)
    readonly limit: number;
}

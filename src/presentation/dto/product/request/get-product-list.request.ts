import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { ProductType, ProductOrder } from '../../shared';
import { Type } from 'class-transformer';

export class GetProductListRequest {
    @ApiProperty({ example: ProductType.AURA, enum: ProductType })
    @IsEnum(ProductType)
    readonly type: ProductType;

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

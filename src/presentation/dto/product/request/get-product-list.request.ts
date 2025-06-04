import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { ProductOrder } from '../../shared';
import { Transform, Type } from 'class-transformer';
import { ProductType, productTypes } from 'src/domain/types/product.types';

export class GetProductListRequest {
    @ApiProperty({ example: productTypes[0], enum: productTypes })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toUpperCase();
        }
    })
    @IsEnum(productTypes)
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

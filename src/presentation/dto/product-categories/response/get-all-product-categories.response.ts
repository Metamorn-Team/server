import { ApiProperty } from '@nestjs/swagger';

export class ProductCategoryItem {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: '오라' })
    readonly name: string;
}

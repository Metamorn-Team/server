import { ApiProperty } from '@nestjs/swagger';

class CategoryItem {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: '오라' })
    readonly name: string;
}

export class GetAllProductCategoriesResponse {
    @ApiProperty({ type: [CategoryItem] })
    readonly categories: CategoryItem[];
}

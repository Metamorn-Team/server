import { ApiProperty } from '@nestjs/swagger';

export class TagItem {
    @ApiProperty({ example: 'uuid' })
    readonly id: string;

    @ApiProperty({ example: '자유' })
    readonly name: string;
}

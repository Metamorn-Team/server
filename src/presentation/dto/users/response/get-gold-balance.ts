import { ApiProperty } from '@nestjs/swagger';

export class GetGoldBalance {
    @ApiProperty({ example: 2000 })
    readonly goldBalance: number;
}

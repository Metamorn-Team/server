import { ApiProperty } from '@nestjs/swagger';

export class GetUnreadRequestResponse {
    @ApiProperty({ example: 3 })
    readonly count: number;
}

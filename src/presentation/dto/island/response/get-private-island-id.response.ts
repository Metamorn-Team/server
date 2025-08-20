import { ApiProperty } from '@nestjs/swagger';

export class GetPrivateIslandIdResponse {
    @ApiProperty({
        description: 'ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    readonly id: string;

    @ApiProperty({
        description: '비밀번호 존재 여부',
        example: true,
    })
    readonly hasPassword: boolean;
}

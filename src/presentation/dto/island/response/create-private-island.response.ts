import { ApiProperty } from '@nestjs/swagger';

export class CreatePrivateIslandResponse {
    @ApiProperty({
        description: '섬 ID',
        example: 'uuid',
    })
    readonly id: string;

    @ApiProperty({
        description: '섬 URL 경로',
        example: 'Fhd2tkad (랜덤 문자열)',
    })
    readonly urlPath: string;
}

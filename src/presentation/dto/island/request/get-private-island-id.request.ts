import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class GetPrivateIslandIdRequest {
    @ApiProperty({
        description: 'URL 경로 문자열',
        example: 'Wg1fdwH5',
    })
    @IsString()
    @Length(8, 8)
    readonly urlPath: string;
}

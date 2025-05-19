import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class GetPresignedUrlRequest {
    @ApiProperty({
        description: 'S3 내 presigned URL을 생성할 대상 경로. (앞 "/" 없이)',
        example: 'island',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @Matches(/^[\w\-./]+$/, {
        message: 'path는 영문, 숫자, -, _, /, . 만 포함해야 합니다.',
    })
    readonly path: string;
}

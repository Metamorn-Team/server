import { ApiProperty } from '@nestjs/swagger';

export class GetPresignedUrlResponse {
    @ApiProperty()
    readonly presignedUrl: string;

    @ApiProperty({
        description: '업로드될 파일의 경로 이름.',
        example: 'island/uuid',
    })
    readonly key: string;
}

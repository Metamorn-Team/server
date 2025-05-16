import { ApiProperty } from '@nestjs/swagger';
import { Length, Matches } from 'class-validator';

export class ChangeTagRequest {
    @ApiProperty({
        example: 'tag_example',
        description: '사용자 태그는 4~15자, 영어 소문자만 가능합니다.',
    })
    @Length(4, 15, { message: '태그는 4~15자여야 합니다.' })
    @Matches(/^[a-z_]+$/m, {
        message: '태그는 영어 소문자와 언더바만 가능합니다.',
    })
    readonly tag: string;
}

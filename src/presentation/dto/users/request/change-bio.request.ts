import { ApiProperty } from '@nestjs/swagger';
import { Length, ValidateIf } from 'class-validator';

export class ChangeBioRequest {
    @ApiProperty({
        example: '저는 접니다.',
        description: '자기소개 텍스트 (최대 300자), null이면 없애기',
        nullable: true,
    })
    @ValidateIf((v: ChangeBioRequest) => v.bio !== null)
    @Length(1, 300)
    readonly bio: string | null;
}

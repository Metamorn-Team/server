import { ApiProperty } from '@nestjs/swagger';
import { Length, ValidateIf } from 'class-validator';

export class ChangeBioRequest {
    @ApiProperty({
        example: '자기소개입니다.',
        description: '자기소개 텍스트 (최대 30자)',
        nullable: true,
    })
    @ValidateIf((v) => v !== null)
    @Length(1, 300)
    readonly bio: string | null;
}

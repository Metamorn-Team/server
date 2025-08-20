import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePrivateIslandRequest {
    @ApiProperty({
        description: '맵 Key',
        example: 'good-island',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    readonly mapKey: string;

    @ApiProperty({
        description: '섬 이름',
        example: '친구들의 섬',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({
        description: '섬 설명',
        example: '친구들의 섬',
        type: String,
    })
    @IsString()
    @IsOptional()
    readonly description?: string;

    @ApiProperty({
        description: '섬 커버 이미지',
        example: 'https://example.com/cover.jpg',
        type: String,
    })
    @IsString()
    @IsOptional()
    readonly coverImage?: string;

    @ApiProperty({
        description: '공개 여부',
        example: true,
        type: Boolean,
    })
    @IsBoolean()
    readonly isPublic: boolean;

    @ApiProperty({
        description: '비밀번호 (선택사항)',
        example: 'password123',
        required: false,
        type: String,
    })
    @IsOptional()
    @IsString()
    readonly password?: string;
}

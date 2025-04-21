import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
    MinLength,
} from 'class-validator';

export enum Varient {
    TAG = 'TAG',
    NICKNAME = 'NICKNAME',
}

export class SearchUsersRequest {
    @ApiProperty({
        name: 'search',
        description: '검색할 닉네임 또는 태그',
        type: String,
    })
    @MinLength(2, { message: '검색어는 최소 2자 이상 입력해주세요' })
    @IsString()
    readonly search: string;

    @ApiProperty({
        name: 'varient',
        enum: Varient,
        description: '검색 기준 (닉네임 또는 태그)',
    })
    @IsEnum(Varient)
    readonly varient: Varient;

    @ApiProperty({
        name: 'limit',
        description: '한 페이지에 보여줄 유저 수 (기본값 10)',
        required: false,
        type: Number,
    })
    @IsString()
    @IsOptional()
    readonly cursor?: string;

    @ApiProperty({
        name: 'cursor',
        description: '다음 페이지 시작점 ID',
        required: false,
        type: String,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly limit?: number = 10;
}

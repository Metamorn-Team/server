import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetFriendsRequest {
    @ApiPropertyOptional({
        description: '페이지네이션 커서 (다음 페이지의 친구 관계의 ID)',
    })
    @IsOptional()
    @IsString()
    readonly cursor?: string;

    @ApiPropertyOptional({
        description: '한 페이지에 가져올 친구 수 (기본값: 20)',
        default: 10,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly limit?: number = 10;
}

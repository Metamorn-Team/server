import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum FriendRequestDirection {
    SENT = 'sent',
    RECEIVED = 'received',
}

export class GetFriendRequestListRequest {
    @ApiProperty({
        enum: FriendRequestDirection,
        description:
            '조회할 친구 요청 방향 (sent: 보낸 요청, received: 받은 요청)',
        required: true,
        example: FriendRequestDirection.SENT,
    })
    @IsEnum(FriendRequestDirection)
    readonly direction: FriendRequestDirection;

    @ApiPropertyOptional({
        description: '페이지네이션 커서 (Friend Request ID',
    })
    @IsOptional()
    @IsString()
    readonly cursor?: string;

    @ApiPropertyOptional({
        description: '한 페이지에 가져올 항목 수 (기본값: 10)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly limit?: number = 10;
}

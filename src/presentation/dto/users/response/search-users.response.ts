import { ApiProperty } from '@nestjs/swagger';
import { GetUserResponse } from './get-user.response';
import { FriendRequestStatus, Provider } from '../../shared';

export class User {
    @ApiProperty({
        description: '사용자 ID(UUID V4)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    readonly id: string;

    @ApiProperty({ description: '사용자 이메일', example: 'user@eamil.com' })
    readonly email: string;

    @ApiProperty({ description: '사용자 닉네임', example: 'nickname' })
    readonly nickname: string;

    @ApiProperty({ description: '사용자 태그', example: 'tag' })
    readonly tag: string;

    @ApiProperty({
        description: '소셜 로그인 제공자',
        enum: ['GOOGLE', 'KAKAO', 'NAVER'],
    })
    readonly provider: Provider;

    @ApiProperty({ description: '사용자 아바타 키' })
    readonly avatarKey: string;

    @ApiProperty({
        description:
            '요청자와 타겟 유저간의 친구 요청 상태 ACCEPTED | SENT | RECEIVED | NONE',
        example: 'ACCEPTED',
    })
    readonly friendStatus: FriendRequestStatus;
}

export class SearchUserResponse {
    @ApiProperty({
        description: '검색된 사용자 목록',
        type: () => GetUserResponse,
        isArray: true,
    })
    readonly data: User[];

    @ApiProperty({
        description: '다음 페이지 시작점 ID, 마지막 페이지인 경우 null',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
        required: false,
    })
    readonly nextCursor: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '../../shared';
import { FriendRequestStatus } from '../../../../domain/types/friend.types';

export class GetUserResponse {
    @ApiProperty({
        description: '타겟 사용자 ID(UUID V4)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    readonly id: string;

    @ApiProperty({
        description: '타겟 사용자의 이메일',
        example: 'user@eamil.com',
    })
    readonly email: string;

    @ApiProperty({ description: '타겟 사용자의 닉네임', example: 'nickname' })
    readonly nickname: string;

    @ApiProperty({ description: '타겟 사용자의 태그', example: 'tag' })
    readonly tag: string;

    @ApiProperty({
        description: '타겟 사용자의 소셜 로그인 제공자',
        enum: ['GOOGLE', 'KAKAO', 'NAVER'],
    })
    readonly provider: Provider;

    @ApiProperty({ description: '타겟 사용자의 아바타 키' })
    readonly avatarKey: string;

    @ApiProperty({
        description:
            '요청자와 타겟 유저가 친구 상태일 경우 ACCEPTED 아닐 경우 null',
        example: 'ACCEPTED',
    })
    readonly friendStatus: FriendRequestStatus;
}

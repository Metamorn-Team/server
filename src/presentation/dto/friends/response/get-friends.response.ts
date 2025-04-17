import { ApiProperty } from '@nestjs/swagger';

export class FriendUserInfo {
    @ApiProperty({ description: '친구의 유저 ID' })
    readonly id: string;

    @ApiProperty({ description: '친구의 닉네임' })
    readonly nickname: string;

    @ApiProperty({ description: '친구의 태그' })
    readonly tag: string;

    @ApiProperty({ description: '친구의 아바타 키' })
    readonly avatarKey: string;

    @ApiProperty({ description: '친구 관계 ID (friend_request 테이블의 ID' })
    readonly friendshipId: string;

    @ApiProperty({ description: '친구가 된 시각 (요청 수락 시간)' })
    readonly becameFriendAt: Date;
}

export class GetFriendsResponse {
    @ApiProperty({
        type: [FriendUserInfo],
        description: '친구 목록',
    })
    readonly data: FriendUserInfo[];

    @ApiProperty({
        description:
            '다음페이지 시작점 커서 (Friendship ID), 마지막 페이지인 경우 null',
        nullable: true,
        required: false,
    })
    readonly nextCursor: string | null;
}

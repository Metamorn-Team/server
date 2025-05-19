import { ApiProperty } from '@nestjs/swagger';

class FriendRequestUserInfo {
    @ApiProperty({
        description: '유저 ID (UUID)',
        example: 'f8dc4ae4-69a6-46ad-8b2d-239ec535ef8f',
    })
    readonly id: string;
    @ApiProperty({ description: '유저 닉네임', example: '두리' })
    readonly nickname: string;
    @ApiProperty({ description: '유저 태그', example: '태그태그태그' })
    readonly tag: string;
    @ApiProperty({ description: '유저 아바타 키' })
    readonly avatarKey: string;
}

export class FriendRequestItem {
    @ApiProperty({
        description: '친구 요청 ID (UUID)',
        example: '1af038aa-ad40-4b49-b484-2491681a813b',
    })
    readonly id: string;

    @ApiProperty({
        type: FriendRequestUserInfo,
        description:
            '상대방 유저 정보 (direction=received 이면 보낸 사람, direction=sent 이면 받은 사람)',
    })
    readonly user: FriendRequestUserInfo;

    @ApiProperty({ description: '친구 요청 보낸/받은 시간' })
    readonly createdAt: Date;
}

export class GetFriendRequestsResponse {
    @ApiProperty({
        type: [FriendRequestItem],
        description: '친구 요청 목록',
    })
    readonly data: FriendRequestItem[];

    @ApiProperty({
        description: '다음 페이지 시작점 ID, 마지막 페이지인 경우 null',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
        required: false,
    })
    readonly nextCursor: string | null;
}

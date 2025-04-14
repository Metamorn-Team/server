import { ApiProperty } from '@nestjs/swagger';

class FriendRequestUserInfoDto {
    @ApiProperty({ description: '유저 ID' })
    readonly id: string;
    @ApiProperty({ description: '유저 닉네임' })
    readonly nickname: string;
    @ApiProperty({ description: '유저 태그' })
    readonly tag: string;
    @ApiProperty({ description: '유저 아바타 키' })
    readonly avatarKey: string;
}

export class FriendRequestItemDto {
    @ApiProperty({ description: '친구 요청 ID' })
    readonly id: string;

    @ApiProperty({
        type: FriendRequestUserInfoDto,
        description:
            '상대방 유저 정보 (direction=received 이면 보낸 사람, direction=sent 이면 받은 사람)',
    })
    readonly user: FriendRequestUserInfoDto;

    @ApiProperty({ description: '친구 요청 보낸/받은 시간' })
    readonly createdAt: Date;
}

export class GetFriendRequestsResponseDto {
    @ApiProperty({
        type: [FriendRequestItemDto],
        description: '친구 요청 목록',
    })
    readonly data: FriendRequestItemDto[];

    @ApiProperty({
        description: '다음 페이지 시작점 ID, 마지막 페이지인 경우 null',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
        required: false,
    })
    readonly nextCursor: string | null;
}

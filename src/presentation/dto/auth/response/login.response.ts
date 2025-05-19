import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
    @ApiProperty({
        description: '사용자 고유 ID(UUID V4)',
        example: 'f8dc4ae4-69a6-46ad-8b2d-239ec535ef8f',
    })
    readonly id: string;

    @ApiProperty({ description: '로그인 성공 시 발급되는 액세스 토큰(JWT)' })
    readonly accessToken: string;

    @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
    readonly email: string;

    @ApiProperty({ description: '사용자 닉네임', example: 'nickname' })
    readonly nickname: string;

    @ApiProperty({ description: '사용자 태그', example: 'tag' })
    readonly tag: string;

    @ApiProperty({ description: '사용자 아바타 키' })
    readonly avatarKey: string;
}

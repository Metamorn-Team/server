import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Provider } from '../../shared';

export class GetUserResponse {
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

    @ApiPropertyOptional({
        description: '요청자와 친구 상태일 경우 ACCEPTED 아닐 경우 null',
        nullable: true,
        example: 'ACCEPTED',
    })
    readonly friendStatus?: string | null;
}

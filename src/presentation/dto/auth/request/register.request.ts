import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, Length, Matches } from 'class-validator';
import { Provider } from '../../shared';

export class RegisterRequest {
    @ApiProperty({ example: 'example@email.com' })
    @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
    readonly email: string;

    @ApiProperty({ example: '두리' })
    @Length(2, 20, { message: '닉네임은 2~20자여야 합니다.' })
    readonly nickname: string;

    @ApiProperty({
        description:
            '사용자의 태그 4~15자 제한, 영어 소문자/숫자/언더바만 가능',
        example: 'tag_123',
    })
    @Length(4, 15, { message: '태그는 4~15자여야 합니다.' })
    @Matches(/^[a-z0-9_]+$/, {
        message: '태그는 영어 소문자, 숫자, 언더바만 가능합니다.',
    })
    readonly tag: string;

    @ApiProperty()
    @IsIn(['GOOGLE', 'KAKAO', 'NAVER'], {
        message: 'provider는 GOOGLE, KAKAO, NAVER만 가능합니다.',
    })
    readonly provider: Provider;

    @ApiProperty()
    @IsString()
    readonly avatarKey: string;
}

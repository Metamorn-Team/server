import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, Length } from 'class-validator';
import { Provider } from '../../shared';

export class RegisterRequest {
    @ApiProperty({ example: 'example@email.com' })
    @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
    readonly email: string;

    @ApiProperty({ example: '두리' })
    @Length(2, 20)
    readonly nickname: string;

    @ApiProperty({
        description: '사용자의 태그 5~50자 제한',
        example: '태그태그태그',
    })
    @Length(5, 50)
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

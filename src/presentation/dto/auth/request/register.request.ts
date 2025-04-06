import { IsEmail, IsIn, Length } from 'class-validator';
import { Provider } from 'src/shared/types';

export class RegisterRequest {
    @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
    readonly email: string;

    @Length(2, 20)
    readonly nickname: string;

    @Length(5, 50)
    readonly tag: string;

    @IsIn(['GOOGLE', 'KAKAO', 'NAVER'], {
        message: 'provider는 GOOGLE, KAKAO, NAVER만 가능합니다.',
    })
    readonly provider: Provider;

    readonly avatarKey: string;
}

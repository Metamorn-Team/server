import { Injectable } from '@nestjs/common';
import { Provider } from 'src/shared/types';
import { OauthUserInfo } from 'src/infrastructure/auth/strategy/oauth.strategy';
import { GoogleStrategy } from 'src/infrastructure/auth/strategy/google.strategy';
import { KakaoStrategy } from 'src/infrastructure/auth/strategy/kakao.strategy';

@Injectable()
export class OauthContext {
    constructor(
        private readonly googleStrategy: GoogleStrategy,
        private readonly kakaoStrategy: KakaoStrategy,
    ) {}

    async getUserInfo(
        provider: Provider,
        token: string,
    ): Promise<OauthUserInfo> {
        switch (provider) {
            case 'GOOGLE':
                return await this.googleStrategy.getUserInfo(token);
            case 'KAKAO':
                return await this.kakaoStrategy.getUserInfo(token);
            case 'NAVER':
                // 네이버 구현 완료 후 추가 필요
                return { email: 'naver', name: 'john doe', provider: 'NAVER' };
            default:
                throw new Error(
                    `지원하지 않는 provider: ${provider as string}`,
                );
        }
    }
}

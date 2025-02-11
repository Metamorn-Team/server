import { Injectable } from '@nestjs/common';
import { Provider } from 'src/shared/types';
import { OauthUserInfo } from 'src/infrastructure/auth/strategy/oauth.strategy';
import { GoogleStrategy } from 'src/infrastructure/auth/strategy/google.strategy';

@Injectable()
export class OauthContext {
    constructor(private readonly googleStrategy: GoogleStrategy) {}

    async getUserInfo(
        provider: Provider,
        token: string,
    ): Promise<OauthUserInfo> {
        // 카카오 네이버 구현 완료 후 추가 필요
        return provider === 'GOOGLE'
            ? await this.googleStrategy.getUserInfo(token)
            : provider === 'KAKAO'
            ? { email: 'kakao', name: 'john doe', provider: 'KAKAO' }
            : { email: 'naver', name: 'john doe', provider: 'NAVER' };
    }
}

import { InternalServerErrorException } from '@nestjs/common';
import { KAKAO_USER_INFO_URL } from 'src/common/constants';
import {
    OauthStrategy,
    OauthUserInfo,
} from 'src/infrastructure/auth/strategy/oauth.strategy';

export class KakaoStrategy implements OauthStrategy {
    async getUserInfo(token: string): Promise<OauthUserInfo> {
        const response = await fetch(KAKAO_USER_INFO_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new InternalServerErrorException(
                `Kakao API 에러: ${response.status} ${response.statusText}`,
            );
        }

        const json: unknown = await response.json();
        if (!this.isKakaoUserInfo(json)) throw new Error();
        const { kakao_account } = json;

        return {
            name: kakao_account.email,
            email: kakao_account.email,
            provider: 'KAKAO',
        };
    }

    isKakaoUserInfo(data: unknown): data is KakaoUserInfo {
        if (typeof data !== 'object' || data === null) return false;

        return (
            'id' in data &&
            'kakao_account' in data &&
            typeof data.kakao_account === 'object' &&
            data.kakao_account !== null &&
            'email' in data.kakao_account
        );
    }
}

interface KakaoUserInfo {
    id: string;
    kakao_account: {
        has_email: boolean;
        email_needs_agreement: boolean;
        is_email_valid: boolean;
        is_email_verified: boolean;
        email: string;
    };
}

import { InternalServerErrorException } from '@nestjs/common';
import { GOOGLE_USER_INFO_URL } from 'src/common/constants';
import {
    OauthStrategy,
    OauthUserInfo,
} from 'src/infrastructure/auth/strategy/oauth.strategy';

export class GoogleStrategy implements OauthStrategy {
    async getUserInfo(token: string): Promise<OauthUserInfo> {
        const response = await fetch(GOOGLE_USER_INFO_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new InternalServerErrorException(
                `Google API 에러: ${response.status} ${response.statusText}`,
            );
        }

        const json: unknown = await response.json();
        if (!this.isGoogleUserInfo(json)) throw new Error();
        const { name, email } = json;

        return {
            name,
            email,
            provider: 'GOOGLE',
        };
    }

    isGoogleUserInfo(data: unknown): data is GoogleUserInfo {
        if (typeof data !== 'object' || data === null) return false;

        return (
            'sub' in data &&
            'name' in data &&
            'email' in data &&
            'email_verified' in data
        );
    }
}

interface GoogleUserInfo {
    sub: string;
    name: string;
    email: string;
    email_verified: boolean;
}

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

        const body: GoogleUserInfo = await response.json();
        const { name, email } = body;

        return {
            name,
            email,
            provider: 'GOOGLE',
        };
    }
}

interface GoogleUserInfo {
    sub: string;
    name: string;
    email: string;
    email_verified: boolean;
}

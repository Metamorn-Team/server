import { Provider } from 'src/shared/types';
export interface OauthStrategy {
    getUserInfo(token: string): Promise<OauthUserInfo>;
}

export interface OauthUserInfo {
    email: string;
    name: string;
    provider: Provider;
}

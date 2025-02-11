import { Provider } from 'src/shared/types';

export interface UserInfo {
    readonly id: string;
    readonly email: string;
    readonly nickname: string;
    readonly tag: string;
    readonly provider: Provider;
}

export interface UserPrototype {
    readonly email: string;
    readonly nickname: string;
    readonly tag: string;
    readonly provider: Provider;
}

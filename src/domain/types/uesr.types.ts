import { Provider } from 'src/shared/types';

export const searchVarients = ['TAG', 'NICKNAME'] as const;
export type SearchVarient = (typeof searchVarients)[number];

export interface UserInfo {
    readonly id: string;
    readonly email: string;
    readonly nickname: string;
    readonly tag: string;
    readonly provider: Provider;
    readonly avatarKey: string;
}

export interface UserPrototype {
    readonly email: string;
    readonly nickname: string;
    readonly tag: string;
    readonly provider: Provider;
    readonly avatarKey: string;
}

export interface PaginatedUsers {
    data: UserInfo[];
    nextCursor: string | null;
}

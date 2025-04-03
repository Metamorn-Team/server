import { UserInfo } from 'src/domain/types/uesr.types';
export class SearchUserResponse {
    readonly data: UserInfo[];

    readonly nextCursor: string | null;
}

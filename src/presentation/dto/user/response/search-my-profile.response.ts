import { Provider } from 'src/shared/types';

export class SearchMyProfileResponse {
    readonly id: string;

    readonly email: string;

    readonly nickname: string;

    readonly tag: string;

    readonly provider: Provider;
}

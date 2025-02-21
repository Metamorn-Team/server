import { Provider } from 'src/shared/types';

export class GetUserResponse {
    readonly id: string;

    readonly email: string;

    readonly nickname: string;

    readonly tag: string;

    readonly provider: Provider;
}

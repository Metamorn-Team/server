export class SearchUserResponse {
    readonly data: {
        readonly id: string;

        readonly email: string;

        readonly nickname: string;

        readonly tag: string;

        readonly provider: string;
    }[];
    readonly meta: {
        readonly nextCursor: string | null;
        readonly count: number;
    };
}

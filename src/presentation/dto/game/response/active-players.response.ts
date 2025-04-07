interface ActivePlayer {
    readonly id: string;
    readonly nickname: string;
    readonly tag: string;
    readonly avatarKey: string;
    readonly x: number;
    readonly y: number;
}

export type ActivePlayerResponse = ActivePlayer[];

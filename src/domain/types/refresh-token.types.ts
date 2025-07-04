export interface RefreshTokenUpdateData {
    readonly token?: string;
    readonly lastUsedAt?: Date;
    readonly expiredAt?: Date;
}

export interface RefreshToken {
    readonly id: string;
    readonly token: string;
    readonly userId: string;
    readonly sessionId: string;
    readonly model: string;
    readonly os: string;
    readonly ip: string;
    readonly browser: string | null;
}

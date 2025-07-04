export interface RefreshTokenPrototype {
    readonly token: string;
    readonly userId: string;
    readonly sessionId: string;
    readonly model: string;
    readonly os: string;
    readonly ip: string;
    readonly browser?: string;
}

export class RefreshTokenEntity {
    constructor(
        public readonly id: string,
        public readonly token: string,
        public readonly userId: string,
        public readonly sessionId: string,
        public readonly model: string,
        public readonly os: string,
        public readonly createdAt: Date,
        public readonly lastUsedAt: Date,
        public readonly ip: string,
        public readonly browser?: string,
        public readonly expiredAt?: Date,
    ) {}

    static create(
        proto: RefreshTokenPrototype,
        idGen: () => string,
        stdDate = new Date(),
    ): RefreshTokenEntity {
        return new RefreshTokenEntity(
            idGen(),
            proto.token,
            proto.userId,
            proto.sessionId,
            proto.model,
            proto.os,
            stdDate,
            stdDate,
            proto.ip,
            proto.browser,
        );
    }
}

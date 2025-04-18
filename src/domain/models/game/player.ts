export interface PlayerPrototype {
    readonly id: string;
    readonly clientId: string;
    readonly nickname: string;
    readonly tag: string;
    readonly avatarKey: string;
    readonly roomId: string;
    readonly x: number;
    readonly y: number;
    readonly isFacingRight?: boolean;
    readonly lastMoved?: number;
    readonly lastActivity?: number;
}

export class Player {
    constructor(
        public readonly id: string,
        public readonly clientId: string,
        public roomId: string,
        public nickname: string,
        public tag: string,
        public avatarKey: string,
        public x: number,
        public y: number,
        public isFacingRight: boolean,
        public lastMoved: number,
        public lastActivity: number,
    ) {}

    update<K extends keyof Omit<Player, 'id' | 'clientId'>>(
        key: K,
        value: Player[K],
    ) {
        (this as any)[key] = value;
        this.lastActivity = Date.now();
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.updateLastActivity();
    }

    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    static create(proto: PlayerPrototype) {
        const now = Date.now();

        return new Player(
            proto.id,
            proto.clientId,
            proto.roomId,
            proto.nickname,
            proto.tag,
            proto.avatarKey,
            proto.x,
            proto.y,
            proto.isFacingRight || true,
            proto.lastMoved || now,
            proto.lastActivity || now,
        );
    }
}

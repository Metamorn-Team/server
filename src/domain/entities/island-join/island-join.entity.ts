export interface IslandJoinPrototype {
    islandId: string;
    userId: string;
    leftAt?: Date | null;
}

export class IslandJoinEntity {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly islandId: string,
        readonly joinedAt: Date,
        readonly leftAt: Date | null,
    ) {}

    static create(
        input: IslandJoinPrototype,
        idGen: () => string,
        stdDate = new Date(),
    ): IslandJoinEntity {
        return new IslandJoinEntity(
            idGen(),
            input.userId,
            input.islandId,
            stdDate,
            input.leftAt ?? null,
        );
    }
}

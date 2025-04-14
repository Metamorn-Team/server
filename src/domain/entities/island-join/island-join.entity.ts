export class IslandJoinEntity {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly islandId: string,
        readonly joinedAt: Date,
        readonly leftAt: Date | null,
    ) {}

    static create(
        input: {
            islandId: string;
            userId: string;
            leftAt?: Date | null;
        },
        idGen: () => string,
        stdDate: Date,
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

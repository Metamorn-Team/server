export class IslandEntity {
    constructor(
        readonly id: string,
        readonly tag: string,
        readonly createdAt: Date,
        readonly updatedAt: Date,
        readonly deletedAt: Date | null,
    ) {}

    static create(
        input: { tag: string; deletedAt?: Date | null },
        idGen: () => string,
        stdDate: Date,
        updatedAt?: Date,
    ): IslandEntity {
        return new IslandEntity(
            idGen(),
            input.tag,
            stdDate,
            updatedAt ?? stdDate,
            input.deletedAt ?? null,
        );
    }
}

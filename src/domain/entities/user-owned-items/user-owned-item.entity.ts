export class UserOwnedItemEntity {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly itemId: string,
        readonly acquiredAt: Date,
    ) {}

    static create(
        userId: string,
        itemId: string,
        idGen: () => string,
        stdDate = new Date(),
    ) {
        return new UserOwnedItemEntity(idGen(), userId, itemId, stdDate);
    }

    static createBulk(
        userId: string,
        itemIds: string[],
        idGen: () => string,
        stdDate = new Date(),
    ) {
        return itemIds.map((itemId) =>
            this.create(userId, itemId, idGen, stdDate),
        );
    }
}

export class ProducEntity {
    constructor(
        readonly id: string,
        readonly itemId: string,
        readonly name: string,
        readonly description: string,
        readonly price: number,
        readonly coverImage: string,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    static create(
        proto: {
            ItemId: string;
            name: string;
            description: string;
            price: number;
            coverImage: string;
        },
        idGen: () => string,
        stdDate: Date,
    ) {
        return new ProducEntity(
            idGen(),
            proto.ItemId,
            proto.name,
            proto.description,
            proto.price,
            proto.coverImage,
            stdDate,
            stdDate,
        );
    }
}

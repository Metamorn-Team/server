export class ProducEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly price: number,
        public readonly coverImage: string,
        public readonly categoryId: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly type: string,
        public readonly key: string,
        public readonly grade?: string,
    ) {}

    static create(
        proto: {
            name: string;
            description: string;
            price: number;
            coverImage: string;
            categoryId: string;
            type: string;
            key: string;
            grade?: string;
        },
        idGen: () => string,
        stdDate: Date,
    ) {
        return new ProducEntity(
            idGen(),
            proto.name,
            proto.description,
            proto.price,
            proto.coverImage,
            proto.categoryId,
            stdDate,
            stdDate,
            proto.type,
            proto.key,
            proto.grade,
        );
    }
}

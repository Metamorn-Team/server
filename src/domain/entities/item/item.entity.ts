export class ItemEntity {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly description: string,
        readonly type: string,
        readonly key: string,
        readonly grade: string,
        readonly createdAt: Date,
    ) {}

    static create(
        proto: {
            name: string;
            description: string;
            type: string;
            key: string;
            grade: string;
        },
        idGen: () => string,
        stdDate: Date,
    ) {
        return new ItemEntity(
            idGen(),
            proto.name,
            proto.description,
            proto.type,
            proto.key,
            proto.grade,
            stdDate,
        );
    }
}

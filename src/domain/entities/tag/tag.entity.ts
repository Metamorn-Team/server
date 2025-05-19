export class TagEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly createdAt: Date,
    ) {}

    static create(proto: { id: string; name: string }, stdDate = new Date()) {
        return new TagEntity(proto.id, proto.name, stdDate);
    }
}

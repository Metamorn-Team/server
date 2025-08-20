export interface PrivateIslandPrototype {
    readonly mapId: string;
    readonly ownerId: string;
    readonly urlPath: string;
    readonly name: string;
    readonly isPublic: boolean;
    readonly maxMembers: number;
    readonly password?: string;
    readonly description?: string;
    readonly coverImage?: string;
}

export class PrivateIslandEntity {
    constructor(
        public readonly id: string,
        public readonly mapId: string,
        public readonly ownerId: string,
        public readonly urlPath: string,
        public readonly name: string,
        public readonly isPublic: boolean,
        public readonly maxMembers: number,
        public readonly password: string | null,
        public readonly description: string | null,
        public readonly coverImage: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly deletedAt: Date | null,
    ) {}

    static create(
        prototype: PrivateIslandPrototype,
        idGen: () => string,
        stdDate = new Date(),
    ) {
        return new PrivateIslandEntity(
            idGen(),
            prototype.mapId,
            prototype.ownerId,
            prototype.urlPath,
            prototype.name,
            prototype.isPublic,
            prototype.maxMembers,
            prototype.password ?? null,
            prototype.description ?? null,
            prototype.coverImage ?? null,
            stdDate,
            stdDate,
            null,
        );
    }
}

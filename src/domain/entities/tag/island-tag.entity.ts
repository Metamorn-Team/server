interface IslandTagPrototype {
    readonly islandId: string;
    readonly tagId: string;
}

export class IslandTagEntity {
    constructor(
        public readonly islandId: string,
        public readonly tagId: string,
    ) {}

    static create(proto: IslandTagPrototype) {
        return new IslandTagEntity(proto.islandId, proto.tagId);
    }

    static createBulk(protos: IslandTagPrototype[]) {
        return protos.map((proto) => this.create(proto));
    }
}

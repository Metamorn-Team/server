import { IslandTypeEnum } from 'src/domain/types/island.types';

export interface NormalIslandPrototype {
    readonly maxMembers: number;
    readonly type: IslandTypeEnum;
    readonly name: string;
    readonly description: string;
    readonly coverImage: string;
    readonly ownerId: string;
    readonly mapKey?: string;
    readonly deletedAt?: Date;
}

export interface IslandPrototype {
    readonly maxMembers: number;
    readonly tag?: string;
    readonly type: IslandTypeEnum;
    readonly name?: string;
    readonly description?: string;
    readonly coverImage?: string;
    readonly deletedAt?: Date;
    readonly ownerId?: string;
    readonly mapId?: string;
}

export class IslandEntity {
    constructor(
        readonly id: string,
        readonly maxMembers: number,
        readonly type: IslandTypeEnum,
        readonly createdAt: Date,
        readonly updatedAt: Date,
        readonly mapId?: string,
        readonly ownerId?: string,
        readonly tag?: string,
        readonly name?: string,
        readonly description?: string,
        readonly coverImage?: string,
        readonly deletedAt?: Date,
    ) {}

    static create(
        proto: IslandPrototype,
        idGen: () => string,
        stdDate = new Date(),
        updatedAt?: Date,
    ): IslandEntity {
        return new IslandEntity(
            idGen(),
            proto.maxMembers,
            proto.type,
            stdDate,
            updatedAt ?? stdDate,
            proto.mapId,
            proto.ownerId,
            proto.tag,
            proto.name,
            proto.description,
            proto.coverImage,
            proto.deletedAt,
        );
    }
}

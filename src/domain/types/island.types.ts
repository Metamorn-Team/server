export const islandTypes = ['NORMAL', 'DESERTED'] as const;

export type IslandType = (typeof islandTypes)[number];

export enum IslandTypeEnum {
    NORMAL,
    DESERTED,
    PRIVATE,
}

export const convertNumberToIslandType = (type: number) => {
    switch (type) {
        case 0:
            return IslandTypeEnum.NORMAL;
        case 1:
            return IslandTypeEnum.DESERTED;
        default:
            return IslandTypeEnum.DESERTED;
    }
};

export interface NormalIslandUpdateInput {
    coverImage?: string;
    name?: string;
    description?: string;
    maxMembers?: number;
    ownerId?: string;
}

export interface IslandSummary {
    readonly id: string;
    readonly name: string | null;
    readonly coverImage: string | null;
    readonly maxMembers: number;
    readonly type: IslandTypeEnum;
    readonly createdAt: Date;
    readonly ownerId: string | null;
}

export interface CreatePrivateIslandInput {
    readonly mapKey: string;
    readonly ownerId: string;
    readonly name: string;
    readonly isPublic: boolean;
    readonly password?: string;
}

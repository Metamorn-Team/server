export const islandTypes = ['NORMAL', 'DESERTED'] as const;

export type IslandType = (typeof islandTypes)[number];

export enum IslandTypeEnum {
    NORMAL,
    DESERTED,
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

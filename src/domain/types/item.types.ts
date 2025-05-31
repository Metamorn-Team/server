export const itemGrades = ['NORMAL', 'RARE', 'UNIQUE', 'EPIC'] as const;
export type ItemGrade = (typeof itemGrades)[number];
export enum ItemGradeEnum {
    NORMAL,
    RARE,
    UNIQUE,
    EPIC,
}

export const convertNumberToItemGrade = (grade: number): ItemGrade =>
    itemGrades[grade];

export const itemTypes = ['AURA', 'SPEECH_BUBBLE'] as const;
export type ItemType = (typeof itemTypes)[number];
export enum ItemTypeEnum {
    AURA,
    SPEECH_BUBBLE,
}

export const convertNumberToItemType = (type: number) => {
    return itemTypes[type];
};

export interface Item {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: ItemType;
    readonly key: string;
    readonly grade: ItemGrade;
}

export const itemGrades = ['NORMAL', 'RARE', 'UNIQUE', 'EPIC'] as const;
export type ItemGrade = (typeof itemGrades)[number];
export enum ItemGradeEnum {
    NORMAL,
    RARE,
    UNIQUE,
    EPIC,
}

export const convertNumberToGrade = (grade: number): ItemGrade => {
    switch (grade) {
        case 0:
            return 'NORMAL';
        case 1:
            return 'RARE';
        case 2:
            return 'UNIQUE';
        case 3:
            return 'EPIC';
        default:
            return 'NORMAL';
    }
};

export const itemTypes = ['AURA', 'SPEECH_BUBBLE'] as const;
export type ItemType = (typeof itemTypes)[number];
export enum ItemTypeEnum {
    AURA,
    SPEECH_BUBBLE,
}

export const convertNumberToType = (type: number) => {
    return itemTypes[type];
};

export interface Item {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: ItemType;
    readonly key: string;
    readonly grade: string;
}

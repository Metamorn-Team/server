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

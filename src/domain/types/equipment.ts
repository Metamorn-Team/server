export const slotTypes = ['AURA', 'SPEECH_BUBBLE'] as const;
export enum SlotTypeEnum {
    AURA,
    SPEECH_BUBBLE,
}
export type SlotType = (typeof slotTypes)[number];
export const convertNumberToSlotType = (type: number) => slotTypes[type];

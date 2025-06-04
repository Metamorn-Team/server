export const slotTypes = ['AURA', 'SPEECH_BUBBLE'] as const;
export enum SlotTypeEnum {
    AURA,
    SPEECH_BUBBLE,
}
export type SlotType = (typeof slotTypes)[number];
export const convertNumberToSlotType = (type: number) => slotTypes[type];

export interface Equipped {
    readonly slot: SlotType;
    readonly key: string;
    readonly name: string;
}

export interface EquippedItemSummary {
    key: string;
    name: string;
}

export type EquipmentState = Record<SlotType, EquippedItemSummary | null>;

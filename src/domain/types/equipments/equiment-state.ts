import {
    Equipped,
    EquippedItemSummary,
} from 'src/domain/types/equipment.types';

export class EquipmentState {
    AURA: EquippedItemSummary | null = null;
    SPEECH_BUBBLE: EquippedItemSummary | null = null;

    static from(equipped: Equipped[]): EquipmentState {
        const state = new EquipmentState();

        for (const item of equipped) {
            state[item.slot] = {
                key: item.key,
                name: item.name,
            };
        }

        return state;
    }
}

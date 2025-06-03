import { Inject, Injectable } from '@nestjs/common';
import { EquipmentRepository } from 'src/domain/interface/equipment.repository';
import {
    EquipmentState,
    SlotType,
    SlotTypeEnum,
} from 'src/domain/types/equipment.types';

@Injectable()
export class EquipmentReader {
    constructor(
        @Inject(EquipmentRepository)
        private readonly equipmentRepository: EquipmentRepository,
    ) {}

    async assertExist(userId: string, slot: SlotType) {
        await this.equipmentRepository.existBySlot(userId, SlotTypeEnum[slot]);
    }

    async readEquipmentState(userId: string) {
        const equippedItems =
            await this.equipmentRepository.findEquippedForEquip(userId);

        const equipments: EquipmentState = {
            AURA: null,
            SPEECH_BUBBLE: null,
        };

        for (const item of equippedItems) {
            equipments[item.slot] = {
                key: item.key,
                name: item.name,
            };
        }

        return equipments;
    }
}

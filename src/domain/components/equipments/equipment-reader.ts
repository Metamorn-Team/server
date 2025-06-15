import { Inject, Injectable } from '@nestjs/common';
import { EquipmentRepository } from 'src/domain/interface/equipment.repository';
import { SlotType, SlotTypeEnum } from 'src/domain/types/equipment.types';
import { EquipmentState } from 'src/domain/types/equipments/equiment-state';

@Injectable()
export class EquipmentReader {
    constructor(
        @Inject(EquipmentRepository)
        private readonly equipmentRepository: EquipmentRepository,
    ) {}

    async assertExist(userId: string, slot: SlotType) {
        await this.equipmentRepository.existBySlot(userId, SlotTypeEnum[slot]);
    }

    async readEquipmentState(userId: string): Promise<EquipmentState> {
        const equippedItems =
            await this.equipmentRepository.findEquippedForEquip(userId);

        return EquipmentState.from(equippedItems);
    }

    async readEquipmentStates(
        userIds: string[],
    ): Promise<Record<string, EquipmentState>> {
        const equippedItems =
            await this.equipmentRepository.findEquippedByUserIds(userIds);

        const result: Record<string, EquipmentState> = {};

        for (const userId of userIds) {
            result[userId] = EquipmentState.from(equippedItems[userId]);
        }

        return result;
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { EquipmentRepository } from 'src/domain/interface/equipment.repository';
import { SlotType, SlotTypeEnum } from 'src/domain/types/equipment';

@Injectable()
export class EquipmentReader {
    constructor(
        @Inject(EquipmentRepository)
        private readonly equipmentRepository: EquipmentRepository,
    ) {}

    async assertExist(userId: string, slot: SlotType) {
        await this.equipmentRepository.existBySlot(userId, SlotTypeEnum[slot]);
    }
}

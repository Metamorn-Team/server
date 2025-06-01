import { Inject, Injectable } from '@nestjs/common';
import {
    EquipmentEntity,
    EquipmentPrototype,
} from 'src/domain/entities/equipments/equipment.entity';
import { EquipmentRepository } from 'src/domain/interface/equipment.repository';
import { SlotType, SlotTypeEnum } from 'src/domain/types/equipment';

@Injectable()
export class EquipmentWriter {
    constructor(
        @Inject(EquipmentRepository)
        private readonly equipmentRepository: EquipmentRepository,
    ) {}

    async upsert(prototype: EquipmentPrototype) {
        const equipment = EquipmentEntity.create(prototype);
        await this.equipmentRepository.upsert(equipment);
    }

    async create(prototype: EquipmentPrototype) {
        const equipment = EquipmentEntity.create(prototype);
        await this.equipmentRepository.save(equipment);
    }

    async updateItem(userId: string, slot: SlotType, itemId: string) {
        await this.equipmentRepository.update(userId, SlotTypeEnum[slot], {
            itemId,
        });
    }
}

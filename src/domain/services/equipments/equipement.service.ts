import { Injectable } from '@nestjs/common';
import { EquipmentWriter } from 'src/domain/components/equipments/equipment-writer';
import { ItemReader } from 'src/domain/components/items/item-reader';
import { SlotType, SlotTypeEnum } from 'src/domain/types/equipment.types';

@Injectable()
export class EquipmentService {
    constructor(
        private readonly equipmentWriter: EquipmentWriter,
        private readonly itemReader: ItemReader,
    ) {}

    async equipItem(userId: string, slot: SlotType, itemId: string) {
        await this.itemReader.assertExist(itemId);
        await this.equipmentWriter.upsert({
            userId,
            itemId,
            slot: SlotTypeEnum[slot],
        });
    }
}

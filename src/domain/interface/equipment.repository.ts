import { EquipmentEntity } from 'src/domain/entities/equipments/equipment.entity';
import { SlotType, SlotTypeEnum } from 'src/domain/types/equipment';

export interface EquipmentRepository {
    save(data: EquipmentEntity): Promise<void>;
    upsert(data: EquipmentEntity): Promise<void>;
    update(
        userId: string,
        slot: SlotTypeEnum,
        data: Partial<Omit<EquipmentEntity, 'userId' | 'slot'>>,
    ): Promise<void>;
    existBySlot(userId: string, slot: SlotTypeEnum): Promise<boolean>;
    findEquippedForEquip(
        userId: string,
    ): Promise<{ slot: SlotType; key: string }[]>;
}

export const EquipmentRepository = Symbol('EquipmentRepository');

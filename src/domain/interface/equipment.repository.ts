import { EquipmentEntity } from 'src/domain/entities/equipments/equipment.entity';
import { Equipped, SlotTypeEnum } from 'src/domain/types/equipment.types';

export interface EquipmentRepository {
    save(data: EquipmentEntity): Promise<void>;
    upsert(data: EquipmentEntity): Promise<void>;
    update(
        userId: string,
        slot: SlotTypeEnum,
        data: Partial<Omit<EquipmentEntity, 'userId' | 'slot'>>,
    ): Promise<void>;
    existBySlot(userId: string, slot: SlotTypeEnum): Promise<boolean>;
    findEquippedForEquip(userId: string): Promise<Equipped[]>;
    findEquippedByUserIds(
        userIds: string[],
    ): Promise<Record<string, Equipped[]>>;
}

export const EquipmentRepository = Symbol('EquipmentRepository');

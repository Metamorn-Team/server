import { SlotTypeEnum } from 'src/domain/types/equipment';

export interface EquipmentPrototype {
    readonly userId: string;
    readonly itemId: string;
    readonly slot: SlotTypeEnum;
    readonly updatedAt?: Date;
}

export class EquipmentEntity {
    constructor(
        readonly userId: string,
        readonly itemId: string,
        readonly slot: SlotTypeEnum,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    static create(
        proto: EquipmentPrototype,
        stdDate = new Date(),
    ): EquipmentEntity {
        return new EquipmentEntity(
            proto.userId,
            proto.itemId,
            proto.slot,
            stdDate,
            proto.updatedAt || stdDate,
        );
    }
}

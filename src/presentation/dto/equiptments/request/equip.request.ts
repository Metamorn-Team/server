import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { SlotType, slotTypes } from '../../../../domain/types/equipment.types';

export class EquipRequest {
    @ApiProperty({ example: 'uuid' })
    @IsUUID(4)
    readonly itemId: string;

    @ApiProperty({ example: slotTypes[0], description: '아이템 슬롯' })
    @IsEnum(slotTypes)
    readonly slot: SlotType;
}

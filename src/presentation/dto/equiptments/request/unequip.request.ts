import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SlotType, slotTypes } from '../../../../domain/types/equipment.types';

export class UnequipRequest {
    @ApiProperty({ example: slotTypes[0], description: '아이템 슬롯' })
    @IsEnum(slotTypes)
    readonly slot: SlotType;
}

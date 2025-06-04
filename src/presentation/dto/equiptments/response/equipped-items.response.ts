import { ApiProperty } from '@nestjs/swagger';
import { SlotType, slotTypes } from 'src/domain/types/equipment';

class EquippedItem {
    @ApiProperty({ example: slotTypes[0], description: '장비 슬롯' })
    readonly slot: SlotType;

    @ApiProperty({ example: 'tomato_aura' })
    readonly key: string;
}

export class EquippedItemsResponse {
    @ApiProperty({ type: [EquippedItem] })
    readonly equippedItems: EquippedItem[];
}

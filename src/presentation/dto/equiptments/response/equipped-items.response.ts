import { ApiProperty } from '@nestjs/swagger';

class EquippedItem {
    @ApiProperty({ example: 'toxic-green-aura' })
    key: string;

    @ApiProperty({ example: '독성 녹색 오라' })
    name: string;
}

class EquipmentState {
    @ApiProperty({ type: EquippedItem, nullable: true })
    AURA: EquippedItem | null;

    @ApiProperty({ type: EquippedItem, nullable: true })
    SPEECH_BUBBLE: EquippedItem | null;
}

export class EquipmentStateResponse {
    @ApiProperty({ type: EquipmentState })
    readonly equipmentState: EquipmentState;
}

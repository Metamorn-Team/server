import { Module } from '@nestjs/common';
import { EquipmentService } from 'src/domain/services/equipments/equipement.service';
import { EquipmentComponentModule } from 'src/modules/equipments/equipment-component.module';
import { ItemComponentModule } from 'src/modules/items/item-component.module';
import { EquipmentController } from 'src/presentation/controller/equipments/equipment.controller';

@Module({
    imports: [EquipmentComponentModule, ItemComponentModule],
    controllers: [EquipmentController],
    providers: [EquipmentService],
    exports: [EquipmentService],
})
export class EquipmentModule {}

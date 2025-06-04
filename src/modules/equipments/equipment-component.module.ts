import { Module } from '@nestjs/common';
import { EquipmentReader } from 'src/domain/components/equipments/equipment-reader';
import { EquipmentWriter } from 'src/domain/components/equipments/equipment-writer';
import { EquipmentRepository } from 'src/domain/interface/equipment.repository';
import { EquipmentPrismaRepository } from 'src/infrastructure/repositories/equipment-prisma.repository';

@Module({
    providers: [
        EquipmentReader,
        EquipmentWriter,
        { provide: EquipmentRepository, useClass: EquipmentPrismaRepository },
    ],
    exports: [EquipmentReader, EquipmentWriter],
})
export class EquipmentComponentModule {}

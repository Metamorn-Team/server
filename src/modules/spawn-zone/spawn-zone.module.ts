import { Module } from '@nestjs/common';
import { SpawnZoneReader } from 'src/domain/components/spawn-zone/spawn-zone-reader';
import { SpawnZoneRepository } from 'src/domain/interface/spawn-zone.repository';
import { SpawnZonePrismaRepository } from 'src/infrastructure/repositories/spawn-zone-prisma.repository';

@Module({
    providers: [
        SpawnZoneReader,
        {
            provide: SpawnZoneRepository,
            useClass: SpawnZonePrismaRepository,
        },
    ],
    exports: [SpawnZoneReader],
})
export class SpawnZoneModule {}

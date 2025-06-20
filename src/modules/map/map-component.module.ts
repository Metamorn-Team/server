import { Module } from '@nestjs/common';
import { MapReader } from 'src/domain/components/map/map-reader';
import { MapRepository } from 'src/domain/interface/map.repository';
import { MapPrismaRepository } from 'src/infrastructure/repositories/map-prisma.repository';

@Module({
    providers: [
        MapReader,
        {
            provide: MapRepository,
            useClass: MapPrismaRepository,
        },
    ],
    exports: [MapReader],
})
export class MapComponentModule {}

import { Module } from '@nestjs/common';
import { MapComponentModule } from 'src/modules/map/map-component.module';
import { MapController } from 'src/presentation/controller/map/map.controller';

@Module({
    imports: [MapComponentModule],
    controllers: [MapController],
})
export class MapModule {}

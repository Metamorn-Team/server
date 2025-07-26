import { Module } from '@nestjs/common';
import { PrivateIslandService } from 'src/domain/services/islands/private-island.service';
import { PrivateIslandController } from 'src/presentation/controller/islands/private-island.controller';
import { PrivateIslandComponentModule } from 'src/modules/islands/private-island-component.module';
import { LivePrivateIslandComponentModule } from 'src/modules/islands/live-private-island-component.module';
import { MapComponentModule } from 'src/modules/map/map-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';

@Module({
    imports: [
        PrivateIslandComponentModule,
        LivePrivateIslandComponentModule,
        MapComponentModule,
        UserComponentModule,
    ],
    controllers: [PrivateIslandController],
    providers: [PrivateIslandService],
})
export class PrivateIslandModule {}

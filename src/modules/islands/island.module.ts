import { Module } from '@nestjs/common';
import { IslandService } from 'src/domain/services/islands/island.service';
import { NormalIslandStorageModule } from 'src/modules/game/normal-island.storaga.module';
import { IslandTagComponentModule } from 'src/modules/island-tags/island-tag-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { TagComponentModule } from 'src/modules/tags/tag-component.module';
import { IslandController } from 'src/presentation/controller/island/island.controller';

@Module({
    imports: [
        IslandComponentModule,
        NormalIslandStorageModule,
        TagComponentModule,
        IslandTagComponentModule,
    ],
    controllers: [IslandController],
    providers: [IslandService],
    exports: [IslandService],
})
export class IslandModule {}

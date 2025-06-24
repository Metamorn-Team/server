import { Module } from '@nestjs/common';
import { GameIslandCreateService } from 'src/domain/services/game/game-island-create.service';
import { IslandActiveObjectSpawnerModule } from 'src/modules/island-spawn-objects/island-active-object-spawner.module';
import { IslandTagComponentModule } from 'src/modules/island-tags/island-tag-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { MapComponentModule } from 'src/modules/map/map-component.module';
import { TagComponentModule } from 'src/modules/tags/tag-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';

@Module({
    imports: [
        UserComponentModule,
        NormalIslandStorageComponentModule,
        IslandComponentModule,
        TagComponentModule,
        IslandTagComponentModule,
        MapComponentModule,
        IslandActiveObjectSpawnerModule,
    ],
    providers: [GameIslandCreateService],
    exports: [GameIslandCreateService],
})
export class GameIslandCreateServiceModule {}

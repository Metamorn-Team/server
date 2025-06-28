import { Module } from '@nestjs/common';
import { IslandLoader } from 'src/domain/loaders/island-loader';
import { IslandActiveObjectSpawnerModule } from 'src/modules/island-spawn-objects/island-active-object-spawner.module';
import { DesertedIslandStorageComponentModule } from 'src/modules/islands/deserted-island-storage-component.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { MapComponentModule } from 'src/modules/map/map-component.module';

@Module({
    imports: [
        IslandActiveObjectSpawnerModule,
        NormalIslandStorageComponentModule,
        DesertedIslandStorageComponentModule,
        MapComponentModule,
    ],
    providers: [IslandLoader],
    exports: [IslandLoader],
})
export class IslandLoaderModule {}

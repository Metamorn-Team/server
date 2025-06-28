import { Module } from '@nestjs/common';
import { InitialDataLoader } from 'src/domain/loaders/Initial-data-loader';
import { PlayerStorageModule } from 'src/modules/game/player-storage.module';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { SpawnZoneModule } from 'src/modules/spawn-zone/spawn-zone.module';
import { PlayerMemoryStorageModule } from 'src/modules/users/player-memory-storage.module';

@Module({
    imports: [
        PlayerStorageModule,
        PlayerMemoryStorageModule,
        IslandActiveObjectComponentModule,
        SpawnZoneModule,
    ],
    providers: [InitialDataLoader],
    exports: [InitialDataLoader],
})
export class LoaderModule {}

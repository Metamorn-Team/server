import { Module } from '@nestjs/common';
import { PlayerLoader } from 'src/domain/loaders/player-loader';
import { PlayerStorageModule } from 'src/modules/game/player-storage.module';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { IslandLoaderModule } from 'src/modules/loaders/island-loader.module';
import { SpawnZoneModule } from 'src/modules/spawn-zone/spawn-zone.module';
import { PlayerMemoryStorageModule } from 'src/modules/users/player-memory-storage.module';

@Module({
    imports: [
        IslandLoaderModule,

        PlayerStorageModule,
        PlayerMemoryStorageModule,
        IslandActiveObjectComponentModule,
        SpawnZoneModule,
    ],
    providers: [PlayerLoader],
    exports: [PlayerLoader],
})
export class PlayerLoaderModule {}

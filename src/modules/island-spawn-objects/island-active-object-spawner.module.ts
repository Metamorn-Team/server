import { Module } from '@nestjs/common';
import { IslandActiveObjectSpawner } from 'src/domain/components/island-spawn-object/island-active-object-spawner';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { RespawnQueueManagerModule } from 'src/modules/island-spawn-objects/respawn-queue-manager.module';
import { SpawnZoneModule } from 'src/modules/spawn-zone/spawn-zone.module';

@Module({
    imports: [
        SpawnZoneModule,
        IslandActiveObjectComponentModule,
        RespawnQueueManagerModule,
    ],
    providers: [IslandActiveObjectSpawner],
    exports: [IslandActiveObjectSpawner],
})
export class IslandActiveObjectSpawnerModule {}

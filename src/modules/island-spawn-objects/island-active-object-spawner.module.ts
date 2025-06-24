import { Module } from '@nestjs/common';
import { IslandActiveObjectSpawner } from 'src/domain/components/island-spawn-object/island-active-object-spawner';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { IslandObjectComponentModule } from 'src/modules/island-spawn-objects/island-object-component.module';
import { SpawnZoneModule } from 'src/modules/spawn-zone/spawn-zone.module';

@Module({
    imports: [
        SpawnZoneModule,
        IslandObjectComponentModule,
        IslandActiveObjectComponentModule,
    ],
    providers: [IslandActiveObjectSpawner],
    exports: [IslandActiveObjectSpawner],
})
export class IslandActiveObjectSpawnerModule {}

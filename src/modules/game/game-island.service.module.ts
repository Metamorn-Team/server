import { Module } from '@nestjs/common';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { RedisTransactionManagerModule } from 'src/infrastructure/redis/redis-transaction-manger.module';
import { EquipmentComponentModule } from 'src/modules/equipments/equipment-component.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandActiveObjectSpawnerModule } from 'src/modules/island-spawn-objects/island-active-object-spawner.module';
import { DesertedIslandStorageComponentModule } from 'src/modules/islands/deserted-island-storage-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { IslandManagerFactoryModule } from 'src/modules/islands/island-manager-factory.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { MapComponentModule } from 'src/modules/map/map-component.module';
import { PlayerSpawnPointComponentModule } from 'src/modules/player-spawn-point/player-spawn-point-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';

@Module({
    imports: [
        EquipmentComponentModule,
        IslandComponentModule,
        IslandJoinComponentModule,
        UserComponentModule,
        PlayerStorageComponentModule,
        DesertedIslandStorageComponentModule,
        NormalIslandStorageComponentModule,
        IslandManagerFactoryModule,
        MapComponentModule,
        PlayerSpawnPointComponentModule,
        IslandActiveObjectSpawnerModule,
        RedisTransactionManagerModule,
    ],
    providers: [GameIslandService],
    exports: [GameIslandService],
})
export class GameIslandServiceModule {}

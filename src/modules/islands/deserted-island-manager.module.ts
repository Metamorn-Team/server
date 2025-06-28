import { Module } from '@nestjs/common';
import { DesertedIslandManager } from 'src/domain/components/islands/deserted-storage/deserted-island-manager';
import { RedisTransactionManagerModule } from 'src/infrastructure/redis/redis-transaction-manger.module';
import { EquipmentComponentModule } from 'src/modules/equipments/equipment-component.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { RespawnQueueManagerModule } from 'src/modules/island-spawn-objects/respawn-queue-manager.module';
import { DesertedIslandStorageComponentModule } from 'src/modules/islands/deserted-island-storage-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';

@Module({
    imports: [
        DesertedIslandStorageComponentModule,
        PlayerStorageComponentModule,
        IslandJoinComponentModule,
        IslandComponentModule,
        EquipmentComponentModule,
        IslandActiveObjectComponentModule,
        RedisTransactionManagerModule,
        RespawnQueueManagerModule,
    ],
    providers: [DesertedIslandManager],
    exports: [DesertedIslandManager],
})
export class DesertedIslandManagerModule {}

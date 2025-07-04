import { Module } from '@nestjs/common';
import { NormalIslandManager } from 'src/domain/components/islands/normal-storage/normal-island-manager';
import { RedisTransactionManagerModule } from 'src/infrastructure/redis/redis-transaction-manger.module';
import { EquipmentComponentModule } from 'src/modules/equipments/equipment-component.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { RespawnQueueManagerModule } from 'src/modules/island-spawn-objects/respawn-queue-manager.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';

@Module({
    imports: [
        NormalIslandStorageComponentModule,
        PlayerStorageComponentModule,
        IslandJoinComponentModule,
        IslandComponentModule,
        EquipmentComponentModule,
        IslandActiveObjectComponentModule,
        RedisTransactionManagerModule,
        RespawnQueueManagerModule,
    ],
    providers: [NormalIslandManager],
    exports: [NormalIslandManager],
})
export class NormalIslandManagerModule {}

import { Module } from '@nestjs/common';
import { PrivateIslandManager } from 'src/domain/components/islands/private-storage/private-island-manager';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { RespawnQueueManagerModule } from 'src/modules/island-spawn-objects/respawn-queue-manager.module';
import { EquipmentComponentModule } from 'src/modules/equipments/equipment-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';
import { RedisTransactionManagerModule } from 'src/infrastructure/redis/redis-transaction-manger.module';
import { LivePrivateIslandComponentModule } from 'src/modules/islands/live-private-island-component.module';
import { PrivateIslandPasswordCheckerModule } from 'src/modules/islands/private-island-password-checker.module';

@Module({
    imports: [
        LivePrivateIslandComponentModule,
        PlayerStorageComponentModule,
        IslandJoinComponentModule,
        IslandComponentModule,
        EquipmentComponentModule,
        IslandActiveObjectComponentModule,
        RedisTransactionManagerModule,
        RespawnQueueManagerModule,
        PrivateIslandPasswordCheckerModule,
    ],
    providers: [PrivateIslandManager],
    exports: [PrivateIslandManager],
})
export class PrivateIslandManagerModule {}

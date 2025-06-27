import { Module } from '@nestjs/common';
import { RespawnQueueManager } from 'src/domain/components/game/respawn-queue-manager';
import { RespawnQueueStorageModule } from 'src/modules/game/respawn-queue-storage.module';

@Module({
    imports: [RespawnQueueStorageModule],
    providers: [RespawnQueueManager],
    exports: [RespawnQueueManager],
})
export class RespawnQueueManagerModule {}

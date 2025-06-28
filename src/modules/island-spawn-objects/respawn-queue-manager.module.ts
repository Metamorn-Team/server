import { Module } from '@nestjs/common';
import { RespawnQueueManager } from 'src/domain/components/island-spawn-object/respawn-queue-manager';

@Module({
    providers: [RespawnQueueManager],
    exports: [RespawnQueueManager],
})
export class RespawnQueueManagerModule {}

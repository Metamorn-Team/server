import { Module } from '@nestjs/common';
import { RespawnQueueStorage } from 'src/domain/interface/storages/respawn-queue-storage';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { RespawnQueueRedisStorage } from 'src/infrastructure/redis/respawn-queue-redis-storage';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: RespawnQueueStorage,
            useClass: RespawnQueueRedisStorage,
        },
    ],
    exports: [RespawnQueueStorage],
})
export class RespawnQueueStorageModule {}

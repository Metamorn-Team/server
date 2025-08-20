import { Module } from '@nestjs/common';
import { LivePrivateIslandStorage } from 'src/domain/interface/storages/live-private-island-storage';
import { LivePrivateIslandRedisStorage } from 'src/infrastructure/redis/islands/live-private-island-redis-storage';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: LivePrivateIslandStorage,
            useClass: LivePrivateIslandRedisStorage,
        },
    ],
    exports: [LivePrivateIslandStorage],
})
export class LivePrivateIslandStorageModule {}

import { Module } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { NormalIslandRedisStorage } from 'src/infrastructure/redis/islands/normal-island-redis-storage';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: NormalIslandStorage,
            useClass: NormalIslandRedisStorage,
        },
    ],
    exports: [NormalIslandStorage],
})
export class NormalIslandStorageModule {}

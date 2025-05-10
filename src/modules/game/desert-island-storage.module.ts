import { Module } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { DesertedIslandRedisStorage } from 'src/infrastructure/redis/islands/deserted-island-redis-storage';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: DesertedIslandStorage,
            useClass: DesertedIslandRedisStorage,
        },
    ],
    exports: [DesertedIslandStorage],
})
export class DesertedIslandStorageModule {}

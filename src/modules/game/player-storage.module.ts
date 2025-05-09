import { Module } from '@nestjs/common';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { PlayerRedisStorage } from 'src/infrastructure/storages/redis/player-redis-storage';

@Module({
    imports: [RedisModule],
    providers: [{ provide: PlayerStorage, useClass: PlayerRedisStorage }],
    exports: [PlayerStorage],
})
export class PlayerStorageModule {}

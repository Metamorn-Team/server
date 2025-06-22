import { Module } from '@nestjs/common';
import { IslandObjectReader } from 'src/domain/components/island-spawn-object/island-object-reader';
import { IslandObjectWriter } from 'src/domain/components/island-spawn-object/island-object-writer';
import { IslandObjectStorage } from 'src/domain/interface/storages/island-object-storage';
import { IslandObjectRedisStorage } from 'src/infrastructure/redis/island-objects/island-object-redis-storage';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [
        IslandObjectWriter,
        IslandObjectReader,
        {
            provide: IslandObjectStorage,
            useClass: IslandObjectRedisStorage,
        },
    ],
    exports: [IslandObjectWriter, IslandObjectReader],
})
export class IslandObjectComponentModule {}

import { Injectable } from '@nestjs/common';
import { IslandObjectStorage } from 'src/domain/interface/storages/island-object-storage';
import { PersistentObject } from 'src/domain/types/spawn-object/active-object';
import { PERSISTENT_OBJECT_KEY } from 'src/infrastructure/redis/key';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class IslandObjectRedisStorage implements IslandObjectStorage {
    constructor(private readonly redis: RedisClientService) {}

    async create(object: PersistentObject): Promise<void> {
        const key = PERSISTENT_OBJECT_KEY(object.islandId, object.id);
        await this.redis.getClient().hset(key, object);
    }

    async createMany(objects: PersistentObject[]): Promise<void> {
        if (objects.length === 0) {
            return;
        }

        const pipeline = this.redis.getClient().pipeline();

        for (const object of objects) {
            const key = PERSISTENT_OBJECT_KEY(object.islandId, object.id);
            pipeline.hset(key, object);
        }

        await pipeline.exec();
    }
}

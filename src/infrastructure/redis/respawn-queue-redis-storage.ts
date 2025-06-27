import { Injectable } from '@nestjs/common';
import {
    RespawnQueueObject,
    RespawnQueueStorage,
} from 'src/domain/interface/storages/respawn-queue-storage';
import {
    RESPAWN_QUEUE_INDEX_KEY,
    RESPAWN_QUEUE_KEY,
} from 'src/infrastructure/redis/key';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class RespawnQueueRedisStorage implements RespawnQueueStorage {
    constructor(private readonly redis: RedisClientService) {}

    async add(islandId: string, object: RespawnQueueObject): Promise<void> {
        const queueKey = RESPAWN_QUEUE_KEY;
        const indexKey = RESPAWN_QUEUE_INDEX_KEY(islandId);

        const client = this.redis.getClient();
        const pipeline = client.pipeline();

        try {
            pipeline.zadd(queueKey, object.respawnTime, object.objectId);
            pipeline.sadd(indexKey, object.objectId);

            const results = await pipeline.exec();
            if (!results) throw new Error('Redis pipeline failed');

            for (const result of results) {
                const [err] = result;
                if (err) {
                    throw new Error('Redis pipeline failed');
                }
            }
        } catch (e) {
            await client.zrem(queueKey, object.objectId);
            await client.srem(indexKey, object.objectId);
            throw e;
        }
    }

    async addMany(
        islandId: string,
        objects: RespawnQueueObject[],
    ): Promise<void> {
        const queueKey = RESPAWN_QUEUE_KEY;
        const indexKey = RESPAWN_QUEUE_INDEX_KEY(islandId);

        const client = this.redis.getClient();
        const pipeline = client.pipeline();

        try {
            for (const object of objects) {
                pipeline.zadd(queueKey, object.respawnTime, object.objectId);
                pipeline.sadd(indexKey, object.objectId);
            }

            const results = await pipeline.exec();
            if (this.redis.isPipelineFailed(results)) {
                throw new Error('Redis pipeline failed');
            }
        } catch (e) {
            const rollbackPipeline = client.pipeline();
            for (const object of objects) {
                rollbackPipeline.zrem(queueKey, object.objectId);
                rollbackPipeline.srem(indexKey, object.objectId);
            }
            await rollbackPipeline.exec();
            throw e;
        }
    }

    async remove(objectId: string): Promise<void> {
        const key = RESPAWN_QUEUE_KEY;
        await this.redis.getClient().zrem(key, objectId);
    }

    async removeMany(objectIds: string[]): Promise<void> {
        const key = RESPAWN_QUEUE_KEY;
        const client = this.redis.getClient();
        const pipeline = client.pipeline();

        for (const id of objectIds) {
            pipeline.zrem(key, id);
        }

        const results = await pipeline.exec();
        if (this.redis.isPipelineFailed(results)) {
            throw new Error('Redis pipeline failed');
        }
    }

    async removeAllByIslandId(islandId: string): Promise<void> {
        const queueKey = RESPAWN_QUEUE_KEY;
        const indexKey = RESPAWN_QUEUE_INDEX_KEY(islandId);

        const client = this.redis.getClient();
        const pipeline = client.pipeline();

        const keys = await client.smembers(indexKey);
        for (const key of keys) {
            pipeline.zrem(queueKey, key);
        }

        const results = await pipeline.exec();
        if (this.redis.isPipelineFailed(results)) {
            throw new Error('Redis pipeline failed');
        }
    }
}

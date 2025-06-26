import { Injectable } from '@nestjs/common';
import { IslandObjectStorage } from 'src/domain/interface/storages/island-object-storage';
import {
    ObjectStatus,
    PersistentObject,
    PersistentObjectPrototype,
} from 'src/domain/types/spawn-object/active-object';
import { PERSISTENT_OBJECT_KEY } from 'src/infrastructure/redis/key';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class IslandObjectRedisStorage implements IslandObjectStorage {
    constructor(private readonly redis: RedisClientService) {}

    private parsePersistentObjectPrototype(
        data: Record<string, string>,
    ): PersistentObjectPrototype {
        return {
            id: data.id,
            islandId: data.islandId,
            type: data.type,
            status: data.status as ObjectStatus,
            maxHp: Number(data.maxHp),
            respawnTime: Number(data.respawnTime),
            x: Number(data.x),
            y: Number(data.y),
        };
    }

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

    async readAll(): Promise<PersistentObject[]> {
        const client = this.redis.getClient();
        const keys = await client.keys(`${PERSISTENT_OBJECT_KEY('*', '*')}`);

        if (keys.length === 0) return [];

        const pipeline = client.pipeline();

        keys.forEach((key) => pipeline.hgetall(key));

        const results = await pipeline.exec();
        if (!results) throw new Error('Redis pipeline failed');

        const objects: PersistentObject[] = [];

        for (const result of results) {
            const [err, data] = result;
            if (err) continue;
            objects.push(
                new PersistentObject(
                    this.parsePersistentObjectPrototype(
                        data as Record<string, string>,
                    ),
                ),
            );
        }

        return objects;
    }

    async readAllByIslandId(islandId: string): Promise<PersistentObject[]> {
        const client = this.redis.getClient();
        const keys = await client.keys(
            `${PERSISTENT_OBJECT_KEY(islandId, '*')}`,
        );
        if (keys.length === 0) return [];

        const pipeline = client.pipeline();

        keys.forEach((key) => pipeline.hgetall(key));

        const results = await pipeline.exec();
        if (!results) throw new Error('Redis pipeline failed');

        const objects: PersistentObject[] = [];

        for (const result of results) {
            const [err, data] = result;
            if (err) continue;
            objects.push(
                new PersistentObject(
                    this.parsePersistentObjectPrototype(
                        data as Record<string, string>,
                    ),
                ),
            );
        }

        return objects;
    }

    async deleteAllByIslandId(islandId: string): Promise<void> {
        const client = this.redis.getClient();
        const keys = await client.keys(
            `${PERSISTENT_OBJECT_KEY(islandId, '*')}`,
        );
        if (keys.length === 0) return;

        const pipeline = client.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
    }

    async markAsDead(islandId: string, ids: string[]): Promise<void> {
        await this.changeStatusByIds(islandId, ids, ObjectStatus.DEAD);
    }

    async markAsAlive(islandId: string, ids: string[]): Promise<void> {
        await this.changeStatusByIds(islandId, ids, ObjectStatus.ALIVE);
    }

    private async changeStatusByIds(
        islandId: string,
        ids: string[],
        status: ObjectStatus,
    ): Promise<void> {
        const client = this.redis.getClient();
        const pipeline = client.pipeline();

        for (const id of ids) {
            const key = PERSISTENT_OBJECT_KEY(islandId, id);
            pipeline.hset(key, 'status', status);
        }

        await pipeline.exec();
    }
}

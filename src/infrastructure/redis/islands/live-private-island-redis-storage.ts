import { Injectable } from '@nestjs/common';
import { LivePrivateIslandStorage } from 'src/domain/interface/storages/live-private-island-storage';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import {
    CreateLivePrivateIsland,
    LivePrivateIsland,
} from 'src/domain/types/private-island.types';
import {
    ISLAND_PLAYERS_KEY,
    PRIVATE_ISLAND_KEY,
} from 'src/infrastructure/redis/key';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class LivePrivateIslandRedisStorage implements LivePrivateIslandStorage {
    constructor(private readonly redis: RedisClientService) {}

    async create(island: CreateLivePrivateIsland): Promise<void> {
        const key = PRIVATE_ISLAND_KEY(island.id);
        await this.redis.getClient().hset(key, {
            ...island,
            createdAt: island.createdAt.getTime(),
        });
    }

    async get(islandId: string): Promise<LivePrivateIsland | null> {
        const islandKey = PRIVATE_ISLAND_KEY(islandId);
        const playerKey = ISLAND_PLAYERS_KEY(islandId);

        const [islandInfo, players] = await Promise.all([
            this.redis.getClient().hgetall(islandKey),
            this.redis.getClient().zrange(playerKey, 0, -1),
        ]);

        if (!islandInfo || Object.keys(islandInfo).length === 0) {
            return null;
        }

        return {
            id: islandId,
            coverImage: islandInfo.coverImage,
            createdAt: new Date(Number(islandInfo.createdAt)),
            description: islandInfo.description,
            isPublic: islandInfo.isPublic === 'true',
            mapKey: islandInfo.mapKey,
            max: Number(islandInfo.max),
            name: islandInfo.name,
            ownerId: islandInfo.ownerId,
            password: islandInfo.password,
            players: new Set(players),
            urlPath: islandInfo.urlPath,
            type: IslandTypeEnum.PRIVATE,
        };
    }

    async addPlayer(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);

        const now = Date.now();
        await this.redis.getClient().zadd(key, now, playerId);
    }

    async getPlayerIdsByIslandId(islandId: string): Promise<string[]> {
        const key = ISLAND_PLAYERS_KEY(islandId);

        const data = await this.redis.getClient().zrange(key, 0, -1);
        return data;
    }

    async countPlayer(islandId: string): Promise<number> {
        const key = ISLAND_PLAYERS_KEY(islandId);
        return await this.redis.getClient().zcard(key);
    }

    async removePlayer(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);
        await this.redis.getClient().zrem(key, playerId);
    }

    async delete(islandId: string): Promise<void> {
        const islandKey = PRIVATE_ISLAND_KEY(islandId);
        const playerKey = ISLAND_PLAYERS_KEY(islandId);

        await this.redis.getClient().del(islandKey, playerKey);
    }
}

import { Injectable } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { LiveNormalIsland } from 'src/domain/types/game.types';
import {
    NORMAL_ISLAND_KEY,
    ISLAND_PLAYERS_KEY,
    ISLAND_TAGS_KEY,
} from 'src/infrastructure/redis/key';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class NormalIslandRedisStorage implements NormalIslandStorage {
    constructor(private readonly redis: RedisClientService) {}

    async createIsland(island: LiveNormalIsland) {
        const { players: _, tags, createdAt, ...islandInfo } = island;
        const key = NORMAL_ISLAND_KEY(islandInfo.id);
        const tagsKey = ISLAND_TAGS_KEY(islandInfo.id);

        await Promise.all([
            this.redis.getClient().hset(key, {
                ...islandInfo,
                createdAt: createdAt.getTime(),
            }),
            this.redis.getClient().sadd(tagsKey, ...tags),
        ]);
    }

    async getIsland(islandId: string): Promise<LiveNormalIsland | null> {
        const islandKey = NORMAL_ISLAND_KEY(islandId);
        const tagsKey = ISLAND_TAGS_KEY(islandId);
        const playersKey = ISLAND_PLAYERS_KEY(islandId);

        const [islandInfo, tags, players] = await Promise.all([
            this.redis.getClient().hgetall(islandKey),
            this.redis.getClient().smembers(tagsKey),
            this.redis.getClient().smembers(playersKey),
        ]);

        if (!islandInfo || Object.keys(islandInfo).length === 0) {
            return null;
        }

        return {
            id: islandId,
            name: islandInfo.name,
            description: islandInfo.description,
            coverImage: islandInfo.coverImage,
            max: Number(islandInfo.max),
            type: Number(islandInfo.type),
            createdAt: new Date(Number(islandInfo.createdAt)),
            tags,
            players: new Set(players),
        };
    }

    async getAllIsland(): Promise<LiveNormalIsland[]> {
        const keys = await this.redis.getClient().keys(NORMAL_ISLAND_KEY('*'));
        const islandKeys = keys.filter(
            (key) => !key.includes(':tags') && !key.includes(':players'),
        );

        const islands = await Promise.all(
            islandKeys.map((key) => {
                const id = key.split(':')[1];
                return this.getIsland(id);
            }),
        );

        return islands.filter((island) => island !== null);
    }

    async countPlayer(islandId: string): Promise<number> {
        return await this.redis.getClient().scard(ISLAND_PLAYERS_KEY(islandId));
    }

    async addPlayerToIsland(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);
        const players = await this.redis.getClient().smembers(key);

        if (players.length === 0) {
            await this.redis.getClient().sadd(key, playerId);
            return;
        }
        await this.redis.getClient().sadd(key, playerId);
    }

    async removePlayer(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);
        await this.redis.getClient().srem(key, playerId);
    }

    async getPlayerIdsByIslandId(islandId: string): Promise<string[]> {
        return await this.redis
            .getClient()
            .smembers(ISLAND_PLAYERS_KEY(islandId));
    }

    async delete(islandId: string): Promise<void> {
        await this.redis
            .getClient()
            .del(
                NORMAL_ISLAND_KEY(islandId),
                ISLAND_TAGS_KEY(islandId),
                ISLAND_PLAYERS_KEY(islandId),
            );
    }
}

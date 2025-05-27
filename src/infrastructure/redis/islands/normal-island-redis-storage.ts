import { Injectable } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { LiveNormalIsland } from 'src/domain/types/game.types';
import { NormalIslandUpdateInput } from 'src/domain/types/island.types';
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
            this.redis.getClient().zrange(playersKey, 0, -1),
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
            ownerId: islandInfo.ownerId,
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
        return await this.redis.getClient().zcard(ISLAND_PLAYERS_KEY(islandId));
    }

    async addPlayerToIsland(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);

        const now = Date.now();
        await this.redis.getClient().zadd(key, now, playerId);
    }

    async removePlayer(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);

        await this.redis.getClient().zrem(key, playerId);
    }

    async getPlayerIdsByIslandId(islandId: string): Promise<string[]> {
        const key = ISLAND_PLAYERS_KEY(islandId);

        const data = await this.redis.getClient().zrange(key, 0, -1);
        return data;
    }

    async getFirstPlayerExceptSelf(
        islandId: string,
        playerId: string,
    ): Promise<string | null> {
        const key = ISLAND_PLAYERS_KEY(islandId);

        // 현재는 인원이 적어서 모두 가져와서 계산함
        const players = await this.redis.getClient().zrange(key, 0, -1);
        const fristPlayer = players.find((id) => id !== playerId);

        return fristPlayer || null;
    }

    async update(
        islandId: string,
        data: NormalIslandUpdateInput,
    ): Promise<void> {
        const key = NORMAL_ISLAND_KEY(islandId);
        const updateData = { ...data };

        if (data.maxMembers) {
            updateData['max'] = data.maxMembers;
        }

        await this.redis.getClient().hset(key, updateData);
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

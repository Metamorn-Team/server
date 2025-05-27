import { Injectable } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { LiveDesertedIsland } from 'src/domain/types/game.types';
import {
    DESERTED_ISLAND_KEY,
    ISLAND_PLAYERS_KEY,
} from 'src/infrastructure/redis/key';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class DesertedIslandRedisStorage implements DesertedIslandStorage {
    constructor(private readonly redis: RedisClientService) {}

    async createIsland(island: LiveDesertedIsland) {
        const { players: _, ...islandInfo } = island;
        const key = DESERTED_ISLAND_KEY(islandInfo.id);

        await this.redis.getClient().hset(key, { ...islandInfo });
    }

    async getIsland(islandId: string): Promise<LiveDesertedIsland | null> {
        const islandKey = DESERTED_ISLAND_KEY(islandId);
        const playersKey = ISLAND_PLAYERS_KEY(islandId);

        const [islandInfo, players] = await Promise.all([
            this.redis.getClient().hgetall(islandKey),
            this.redis.getClient().smembers(playersKey),
        ]);

        if (!islandInfo || Object.keys(islandInfo).length === 0) {
            return null;
        }

        return {
            id: islandId,
            max: Number(islandInfo.max),
            type: Number(islandInfo.type),
            players: new Set(players),
        };
    }

    async getAllIsland(): Promise<LiveDesertedIsland[]> {
        const keys = await this.redis
            .getClient()
            .keys(DESERTED_ISLAND_KEY('*'));
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
            .del(DESERTED_ISLAND_KEY(islandId), ISLAND_PLAYERS_KEY(islandId));
    }
}

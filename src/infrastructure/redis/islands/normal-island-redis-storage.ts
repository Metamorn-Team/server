import { HttpStatus, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { LiveNormalIsland } from 'src/domain/types/game.types';
import {
    NORMAL_ISLAND_KEY,
    ISLAND_PLAYERS_KEY,
    ISLAND_TAGS_KEY,
} from 'src/infrastructure/redis/key';
import { RedisClient } from 'src/infrastructure/redis/redis.module';

export class NormalIslandRedisStorage implements NormalIslandStorage {
    constructor(
        @Inject(RedisClient)
        private readonly redis: Redis,
    ) {}

    async createIsland(islandId: string, island: LiveNormalIsland) {
        const { players: _, tags, createdAt, ...islandInfo } = island;
        const key = NORMAL_ISLAND_KEY(islandInfo.id);
        const tagsKey = ISLAND_TAGS_KEY(islandInfo.id);

        await Promise.all([
            this.redis.hset(key, {
                ...islandInfo,
                createdAt: createdAt.getTime(),
            }),
            this.redis.sadd(tagsKey, ...tags),
        ]);
    }

    async getIsland(islandId: string): Promise<LiveNormalIsland> {
        const islandKey = NORMAL_ISLAND_KEY(islandId);
        const tagsKey = ISLAND_TAGS_KEY(islandId);
        const playersKey = ISLAND_PLAYERS_KEY(islandId);

        const [islandInfo, tags, players] = await Promise.all([
            this.redis.hgetall(islandKey),
            this.redis.smembers(tagsKey),
            this.redis.smembers(playersKey),
        ]);

        if (!islandInfo || Object.keys(islandInfo).length === 0) {
            throw new DomainException(
                DomainExceptionType.ISLAND_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                ISLAND_NOT_FOUND_MESSAGE,
            );
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
        const keys = await this.redis.keys(NORMAL_ISLAND_KEY('*'));
        const islandKeys = keys.filter(
            (key) => !key.includes(':tags') && !key.includes(':players'),
        );

        const islands = await Promise.all(
            islandKeys.map((key) => {
                const id = key.split(':')[1];
                return this.getIsland(id);
            }),
        );

        return islands;
    }

    async countPlayer(islandId: string): Promise<number> {
        return await this.redis.scard(ISLAND_PLAYERS_KEY(islandId));
    }

    async addPlayerToIsland(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);
        const players = await this.redis.smembers(key);

        if (players.length === 0) {
            await this.redis.sadd(key, playerId);
            return;
        }
        await this.redis.sadd(key, playerId);
    }

    async removePlayer(islandId: string, playerId: string): Promise<void> {
        const key = ISLAND_PLAYERS_KEY(islandId);
        await this.redis.srem(key, playerId);
    }

    async getPlayerIdsByIslandId(islandId: string): Promise<string[]> {
        return await this.redis.smembers(ISLAND_PLAYERS_KEY(islandId));
    }

    async delete(islandId: string): Promise<void> {
        await this.redis.del(
            NORMAL_ISLAND_KEY(islandId),
            ISLAND_TAGS_KEY(islandId),
            ISLAND_PLAYERS_KEY(islandId),
        );
    }
}

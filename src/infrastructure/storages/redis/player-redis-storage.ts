import { HttpStatus, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { Player } from 'src/domain/models/game/player';
import { RedisClient } from 'src/infrastructure/redis/redis.module';

export class PlayerRedisStorage implements PlayerStorage {
    constructor(
        @Inject(RedisClient)
        private readonly redis: Redis,
    ) {}

    async addPlayer(playerId: string, player: Player): Promise<void> {
        const key = `player:${playerId}`;
        await this.redis.hset(key, player);
    }

    async getPlayer(playerId: string): Promise<Player> {
        const key = `player:${playerId}`;

        const player = await this.redis.hgetall(key);
        if (Object.keys(player).length === 0) {
            throw new DomainException(
                DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                HttpStatus.NOT_FOUND,
                PLAYER_NOT_FOUND_IN_STORAGE,
            );
        }

        return player as unknown as Promise<Player>;
    }

    async getPlayerByClientId(clientId: string): Promise<Player> {
        const keys = await this.redis.keys('player:*');

        for (const key of keys) {
            const player = await this.redis.hgetall(key);

            if (player.clientId === clientId) {
                return player as unknown as Promise<Player>;
            }
        }

        throw new DomainException(
            DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
            HttpStatus.NOT_FOUND,
            PLAYER_NOT_FOUND_IN_STORAGE,
        );
    }

    async getPlayersByIslandId(islandId: string): Promise<Player[]> {
        const keys = await this.redis.keys('player:*');
        const activePlayers: Player[] = [];

        for (const key of keys) {
            const player = await this.redis.hgetall(key);

            if (player.islandId === islandId) {
                activePlayers.push(player as unknown as Player);
            }
        }

        return activePlayers;
    }

    async deletePlayer(playerId: string): Promise<void> {
        const key = `player:${playerId}`;
        await this.redis.del(key);
    }
}

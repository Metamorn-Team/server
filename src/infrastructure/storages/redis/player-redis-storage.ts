import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { Player } from 'src/domain/models/game/player';
import { PLAYER_KEY } from 'src/infrastructure/redis/key';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class PlayerRedisStorage implements PlayerStorage {
    constructor(private readonly redis: RedisClientService) {}

    async addPlayer(playerId: string, player: Player): Promise<void> {
        const key = PLAYER_KEY(playerId);
        await this.redis.getClient().hset(key, player);
    }

    async getPlayer(playerId: string): Promise<Player> {
        const key = PLAYER_KEY(playerId);

        const player = await this.redis.getClient().hgetall(key);
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
        const keys = await this.redis.getClient().keys(PLAYER_KEY('*'));

        for (const key of keys) {
            const player = await this.redis.getClient().hgetall(key);

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
        const keys = await this.redis.getClient().keys(PLAYER_KEY('*'));
        const activePlayers: Player[] = [];

        for (const key of keys) {
            const player = await this.redis.getClient().hgetall(key);

            if (player.islandId === islandId) {
                activePlayers.push(player as unknown as Player);
            }
        }

        return activePlayers;
    }

    async deletePlayer(playerId: string): Promise<void> {
        const key = PLAYER_KEY(playerId);
        await this.redis.getClient().del(key);
    }

    async getAllPlayers(): Promise<Player[]> {
        const keys = await this.redis.getClient().keys(PLAYER_KEY('*'));
        const pipeline = this.redis.getClient().pipeline();

        for (const key of keys) {
            pipeline.hgetall(key);
        }

        const results = await pipeline.exec();
        if (!results) throw new Error();

        const players: Player[] = results
            .map(([err, data]) => {
                if (err || !data || Object.keys(data).length === 0) return null;
                return data as Player;
            })
            .filter((p): p is Player => p !== null) as unknown as Player[];

        return players;
    }

    async updateLastActivity(
        playerId: string,
        now = Date.now(),
    ): Promise<void> {
        const key = PLAYER_KEY(playerId);
        await this.redis.getClient().hset(key, 'lastActivity', now);
    }
}

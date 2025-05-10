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

    private parsePlayer(data: Record<string, string>): Player {
        return {
            id: data.id,
            clientId: data.clientId,
            tag: data.tag,
            nickname: data.nickname,
            avatarKey: data.avatarKey,
            roomId: data.roomId,
            isFacingRight: data.isFacingRight === 'true',
            islandType: Number(data.islandType),
            lastActivity: Number(data.lastActivity),
            lastMoved: Number(data.lastMoved),
            x: Number(data.x),
            y: Number(data.y),
        };
    }

    async addPlayer(playerId: string, player: Player): Promise<void> {
        const key = PLAYER_KEY(playerId);
        await this.redis.getClient().hset(key, player);
    }

    async getPlayer(playerId: string): Promise<Player> {
        const key = PLAYER_KEY(playerId);
        const data = await this.redis.getClient().hgetall(key);

        if (Object.keys(data).length === 0) {
            throw new DomainException(
                DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                HttpStatus.NOT_FOUND,
                PLAYER_NOT_FOUND_IN_STORAGE,
            );
        }

        return this.parsePlayer(data);
    }

    async getPlayerByClientId(clientId: string): Promise<Player> {
        const keys = await this.redis.getClient().keys(PLAYER_KEY('*'));

        for (const key of keys) {
            const data = await this.redis.getClient().hgetall(key);
            if (data.clientId === clientId) {
                return this.parsePlayer(data);
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
        const players: Player[] = [];

        for (const key of keys) {
            const data = await this.redis.getClient().hgetall(key);
            if (data.roomId === islandId) {
                players.push(this.parsePlayer(data));
            }
        }

        return players;
    }

    async deletePlayer(playerId: string): Promise<void> {
        const key = PLAYER_KEY(playerId);
        await this.redis.getClient().del(key);
    }

    async getAllPlayers(): Promise<Player[]> {
        const keys = await this.redis.getClient().keys(PLAYER_KEY('*'));
        const pipeline = this.redis.getClient().pipeline();

        keys.forEach((key) => pipeline.hgetall(key));
        const results = await pipeline.exec();

        if (!results) throw new Error('Redis pipeline failed');

        const players: Player[] = [];

        for (const result of results) {
            const [err, data] = result;

            if (err) {
                continue;
            }

            if (
                data &&
                typeof data === 'object' &&
                Object.keys(data).length > 0
            ) {
                players.push(this.parsePlayer(data as Record<string, string>));
            }
        }

        return players;
    }

    async updateLastActivity(
        playerId: string,
        now = Date.now(),
    ): Promise<void> {
        const key = PLAYER_KEY(playerId);
        await this.redis.getClient().hset(key, 'lastActivity', now.toString());
    }
}

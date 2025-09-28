import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisClientService.name);
    public readonly client: Redis;
    public readonly subscriber: Redis;
    public readonly publisher: Redis;

    constructor(private readonly config: ConfigService) {
        const redis = new Redis({
            host: config.get<string>('REDIS_HOST'),
            port: Number(config.get<string>('REDIS_PORT')),
            connectTimeout: 10000,
            ...(config.get<string>('REDIS_TLS') === 'true' && {
                tls: {},
            }),
        });
        this.client = redis;
        this.subscriber = redis.duplicate();
        this.publisher = redis.duplicate();
    }

    getClient(): Redis {
        return this.client;
    }

    async acquireLock(key: string, ttl = 2000) {
        const id = v4();
        const result = await this.client.set(key, id, 'PX', ttl, 'NX');
        return result === 'OK' ? id : null;
    }

    async releaseLock(key: string, lockId: string): Promise<void> {
        const channel = `${key}:release`;

        const script = `
            -- 현재 락의 값을 조회
            local current_lock = redis.call('GET', KEYS[1])
            
            -- 락이 존재하고 값이 일치하는 경우에만 삭제
            if current_lock == ARGV[1] then
                redis.call('DEL', KEYS[1])
                -- 채널에 해제 알림 발행
                redis.call('PUBLISH', KEYS[2], 'released')
                return 1
            end
            return 0
        `;

        try {
            await this.publisher.eval(script, 2, key, channel, lockId);
        } catch (err) {
            this.logger.error('락 릴리즈 오류:', err);
        }
    }

    async onModuleDestroy() {
        await this.client.quit();
        await this.subscriber.quit();
        await this.publisher.quit();
    }
}

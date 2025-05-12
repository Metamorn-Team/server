import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
    public readonly client: Redis;

    constructor(config: ConfigService) {
        this.client = new Redis({
            host: String(config.get<string>('REDIS_HOST')),
            port: Number(config.get<string>('REDIS_PORT')),
            connectTimeout: 10000,
        });
    }

    getClient(): Redis {
        return this.client;
    }

    async acquireLock(key: string, ttl = 2000) {
        const id = v4();
        const result = await this.client.set(key, id, 'PX', ttl, 'NX');
        return result === 'OK' ? id : null;
    }

    async releaseLock(key: string) {
        await this.client.del(key);
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}

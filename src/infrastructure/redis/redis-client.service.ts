import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
    public readonly client: Redis;

    constructor(config: ConfigService) {
        this.client = new Redis(
            Number(config.get<string>('REDIS_PORT')),
            String(config.get<string>('REDIS_HOST')),
        );
    }

    getClient(): Redis {
        return this.client;
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}

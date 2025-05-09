import { Module } from '@nestjs/common';
import Redis from 'ioredis';

export const RedisClient = Symbol('REDIS_CLIENT');

@Module({
    providers: [
        {
            provide: RedisClient,
            useFactory: () => new Redis(6379),
        },
    ],
    exports: [RedisClient],
})
export class RedisModule {}

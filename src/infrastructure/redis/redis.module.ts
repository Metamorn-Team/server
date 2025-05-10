import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisClient = Symbol('REDIS_CLIENT');

@Module({
    providers: [
        {
            provide: RedisClient,
            useFactory: (config: ConfigService) =>
                new Redis(
                    Number(config.get<string>('REDIS_PORT')),
                    String(config.get<string>('REDIS_PORT')),
                ),
            inject: [ConfigService],
        },
    ],
    exports: [RedisClient],
})
export class RedisModule {}

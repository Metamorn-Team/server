import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Module({
    imports: [ConfigModule],
    providers: [RedisClientService],
    exports: [RedisClientService],
})
export class RedisModule {}

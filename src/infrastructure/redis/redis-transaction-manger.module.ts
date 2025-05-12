import { Module } from '@nestjs/common';
import { RedisTransactionManager } from 'src/infrastructure/redis/redis-transaction-manager';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [RedisTransactionManager],
    exports: [RedisTransactionManager],
})
export class RedisTransactionManagerModule {}

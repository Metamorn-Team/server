import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { LOCK_ACQUIRED_FAILED_MESSAGE } from 'src/domain/exceptions/message';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class RedisTransactionManager {
    constructor(private readonly redis: RedisClientService) {}

    async transaction(
        key: string,
        fns: (() => Promise<any>)[],
        ttl = 2000,
    ): Promise<void> {
        const lockAcquired = await this.redis.acquireLock(key, ttl);
        if (!lockAcquired) {
            throw new DomainException(
                DomainExceptionType.LOCK_ACQUIRED_FAILED,
                HttpStatus.CONFLICT,
                LOCK_ACQUIRED_FAILED_MESSAGE(key),
            );
        }

        try {
            for (const fn of fns) {
                await fn();
            }
        } finally {
            await this.redis.releaseLock(key);
        }
    }
}

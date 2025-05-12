import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { LOCK_ACQUIRED_FAILED_MESSAGE } from 'src/domain/exceptions/message';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

interface TransactionOption {
    execute: () => Promise<any>;
    rollback?: () => Promise<any>;
}

@Injectable()
export class RedisTransactionManager {
    constructor(private readonly redis: RedisClientService) {}

    async transaction(
        key: string,
        options: TransactionOption[],
        ttl = 2000,
        maxRetries = 3,
        retryDelay = 100,
    ): Promise<void> {
        await this.acquireWithRetry(key, ttl, maxRetries, retryDelay);

        let countExecute = 0;

        try {
            for (const option of options) {
                await option.execute();
                countExecute++;
            }
        } catch (e) {
            await this.rollback(countExecute, options);
            throw e;
        } finally {
            await this.redis.releaseLock(key);
        }
    }

    private async acquireWithRetry(
        key: string,
        ttl: number,
        maxRetries: number,
        retryDelay: number,
    ): Promise<boolean> {
        let attempt = 0;

        while (attempt <= maxRetries) {
            const lockAcquired = await this.redis.acquireLock(key, ttl);
            if (lockAcquired) return true;

            if (attempt === maxRetries) break;

            await this.delay(retryDelay);
            attempt++;
        }

        throw new DomainException(
            DomainExceptionType.LOCK_ACQUIRED_FAILED,
            HttpStatus.CONFLICT,
            LOCK_ACQUIRED_FAILED_MESSAGE(key),
        );
    }

    private async rollback(countExecute: number, options: TransactionOption[]) {
        for (let i = countExecute - 1; i >= 0; --i) {
            const { rollback } = options[i];
            if (rollback) {
                await rollback();
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((res) => setTimeout(res, ms));
    }
}

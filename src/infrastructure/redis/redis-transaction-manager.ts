import {
    HttpStatus,
    Injectable,
    Logger,
    OnModuleDestroy,
} from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { LOCK_ACQUIRED_FAILED_MESSAGE } from 'src/domain/exceptions/message';
import {
    TransactionManager,
    TransactionOption,
} from 'src/domain/interface/transaction/transaction-mangaer';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';

@Injectable()
export class RedisTransactionManager
    implements TransactionManager, OnModuleDestroy
{
    private readonly logger = new Logger(RedisTransactionManager.name);
    private subscribedChannels = new Set<string>();
    private waitingContexts = new Map<string, Set<() => void>>();

    constructor(private readonly redis: RedisClientService) {
        // 메시지 이벤트 등록
        this.redis.subscriber.on(
            'message',
            (channel: string, message: string) => {
                this.handleChannelMessage(channel, message);
            },
        );
    }

    private handleChannelMessage(channel: string, message: string): void {
        if (message === 'released') {
            const waitingSet = this.waitingContexts.get(channel);
            if (waitingSet && waitingSet.size > 0) {
                // 대기 중인 모든 컨텍스트에게 재시도 신호 전송
                waitingSet.forEach((resolver) => {
                    try {
                        resolver();
                    } catch (error) {
                        this.logger.error(
                            '컨텍스트 resolver 실행 오류:',
                            error,
                        );
                    }
                });
                // 대기 중인 컨텍스트들 정리
                waitingSet.clear();
            }
        }
    }

    async transaction(
        key: string,
        options: TransactionOption[],
        ttl = 2000,
        maxRetries = 5,
        timeout = 5000,
    ): Promise<void> {
        const lockKey = `lock:${key}`;
        const lockId = await this.acquireLockWithPubSub(
            lockKey,
            ttl,
            maxRetries,
            timeout,
        );

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
            await this.redis.releaseLock(lockKey, lockId);
        }
    }

    private async acquireLockWithPubSub(
        lockKey: string,
        ttl: number,
        maxRetries: number,
        timeout: number,
    ): Promise<string> {
        const channel = `${lockKey}:release`;

        // 채널 구독 (한 번만)
        await this.ensureChannelSubscription(channel);

        let attempt = 0;

        while (attempt <= maxRetries) {
            // 락 획득 시도
            const lockId = await this.redis.acquireLock(lockKey, ttl);
            if (lockId) {
                return lockId; // 락 획득 성공
            }

            // 마지막 시도라면 더 이상 대기하지 않음
            if (attempt === maxRetries) {
                break;
            }

            // 다음 시도를 위해 해제 신호 대기
            await this.waitForRelease(channel, timeout);
            attempt++;
        }

        throw new DomainException(
            DomainExceptionType.LOCK_ACQUIRED_FAILED,
            HttpStatus.CONFLICT,
            LOCK_ACQUIRED_FAILED_MESSAGE(lockKey),
        );
    }

    private async ensureChannelSubscription(channel: string): Promise<void> {
        if (!this.subscribedChannels.has(channel)) {
            await this.redis.subscriber.subscribe(channel);
            this.subscribedChannels.add(channel);

            // 채널별 대기 컨텍스트 Set 초기화
            if (!this.waitingContexts.has(channel)) {
                this.waitingContexts.set(channel, new Set());
            }
        }
    }

    private async waitForRelease(
        channel: string,
        timeout: number,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const wrappedResolver = () => {
                clearTimeout(timeoutId);
                resolve();
            };

            const timeoutId = setTimeout(() => {
                // 타임아웃 시 대기 목록에서 제거
                const waitingSet = this.waitingContexts.get(channel);
                if (waitingSet) {
                    waitingSet.delete(wrappedResolver);
                }

                reject(
                    new DomainException(
                        DomainExceptionType.LOCK_ACQUIRED_FAILED,
                        HttpStatus.REQUEST_TIMEOUT,
                        `타임아웃: ${channel}`,
                    ),
                );
            }, timeout);

            // 이 컨텍스트를 대기 목록에 추가
            const waitingSet = this.waitingContexts.get(channel);
            if (waitingSet) {
                waitingSet.add(wrappedResolver);
            }
        });
    }

    private async rollback(
        countExecute: number,
        options: TransactionOption[],
    ): Promise<void> {
        for (let i = countExecute - 1; i >= 0; i--) {
            const { rollback } = options[i];
            if (rollback) {
                try {
                    await rollback();
                } catch (error) {
                    this.logger.error(`롤백 실행 오류 (인덱스: ${i}):`, error);
                }
            }
        }
    }

    onModuleDestroy() {
        // 구독한 모든 채널 정리
        this.subscribedChannels.clear();
        this.waitingContexts.clear();
    }
}

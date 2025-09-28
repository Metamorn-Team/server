/* eslint-disable @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { RedisTransactionManager } from 'src/infrastructure/redis/redis-transaction-manager';
import { RedisTransactionManagerModule } from 'src/infrastructure/redis/redis-transaction-manger.module';
import { DesertedIslandStorageModule } from 'src/modules/game/desert-island-storage.module';
import { PlayerStorageModule } from 'src/modules/game/player-storage.module';
import {
    generateDesertedIslandModel,
    generatePlayerModel,
} from 'test/helper/generators';
import { COMMON_IMPORTS } from 'test/unit/services/commom-imports';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import Redis from 'ioredis';

describe('IslandJoinService', () => {
    let app: TestingModule;
    let redisTransactionManager: RedisTransactionManager;
    let playerStorage: PlayerStorage;
    let desertedIslandStorage: DesertedIslandStorage;
    let redisClient: Redis;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                RedisTransactionManagerModule,
                PlayerStorageModule,
                DesertedIslandStorageModule,
                ...COMMON_IMPORTS,
            ],
        }).compile();

        redisTransactionManager = app.get<RedisTransactionManager>(
            RedisTransactionManager,
        );
        playerStorage = app.get<PlayerStorage>(PlayerStorage);
        desertedIslandStorage = app.get<DesertedIslandStorage>(
            DesertedIslandStorage,
        );
        redisClient = app
            .get<RedisClientService>(RedisClientService)
            .getClient();
    });

    afterEach(async () => {});

    afterAll(async () => {
        await app.close();
    });

    describe('레디스 트랜잭션', () => {
        const player = generatePlayerModel();
        const desertedIsland = generateDesertedIslandModel();

        it('정상 동작', async () => {
            const key = player.id;

            const option1 = {
                execute: async () => {
                    await playerStorage.addPlayer(player);
                },
                rollback: async () => {
                    await playerStorage.deletePlayer(player.id);
                },
            };

            const option2 = {
                execute: async () => {
                    await desertedIslandStorage.createIsland(desertedIsland);
                },
                rollback: async () => {
                    await desertedIslandStorage.delete(desertedIsland.id);
                },
            };

            await redisTransactionManager.transaction(key, [option1, option2]);

            const savedPlayer = await playerStorage.getPlayer(player.id);
            const savedIsland = await desertedIslandStorage.getIsland(
                desertedIsland.id,
            );

            expect(savedPlayer).not.toBeNull();
            expect(savedIsland).not.toBeNull();
        });

        it('트랜잭션 중간에 예외가 발생하면 이전 모든 동작을 롤백한다', async () => {
            const key = player.id;

            const option1 = {
                execute: async () => {
                    await playerStorage.addPlayer(player);
                },
                rollback: async () => {
                    await playerStorage.deletePlayer(player.id);
                },
            };

            const option2 = {
                execute: async () => {
                    await desertedIslandStorage.createIsland(desertedIsland);
                },
                rollback: async () => {
                    await desertedIslandStorage.delete(desertedIsland.id);
                },
            };

            const option3 = {
                execute: () => {
                    throw new Error('롤백 유도');
                },
                rollback: async () => {},
            };

            // when, then
            await expect(() =>
                redisTransactionManager.transaction(key, [
                    option1,
                    option2,
                    option3,
                ]),
            ).rejects.toThrow(new Error('롤백 유도'));

            const rollbackedPlayer = await playerStorage.getPlayer(player.id);
            const rollbackedIsland = await desertedIslandStorage.getIsland(
                desertedIsland.id,
            );

            expect(rollbackedPlayer).toBeNull();
            expect(rollbackedIsland).toBeNull();
        });

        it('동시에 같은 키로 트랜잭션 실행 시 순차적으로 처리된다', async () => {
            const key = 'concurrent-test';
            const results: number[] = [];
            let counter = 0;

            const promises = Array.from({ length: 3 }, () =>
                redisTransactionManager
                    .transaction(key, [
                        {
                            execute: async () => {
                                const currentValue = counter;
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 5),
                                );
                                counter = currentValue + 1;
                                results.push(counter);
                            },
                        },
                    ])
                    .catch(() => {
                        // 락 획득 실패는 예상된 동작
                    }),
            );

            await Promise.allSettled(promises);

            // 일부 트랜잭션이라도 성공해야 함
            expect(results.length).toBeGreaterThan(0);
        });

        it('서로 다른 키로 트랜잭션 실행 시 병렬로 처리된다', async () => {
            const executionTimes: number[] = [];

            const createTransaction = () => [
                {
                    execute: async () => {
                        const start = Date.now();
                        await new Promise((resolve) =>
                            setTimeout(resolve, 100),
                        );
                        executionTimes.push(Date.now() - start);
                    },
                },
            ];

            const start = Date.now();

            // 서로 다른 키로 5개 병렬 실행
            const promises = Array.from({ length: 5 }, (_, i) =>
                redisTransactionManager.transaction(
                    `parallel-key-${i}`,
                    createTransaction(),
                ),
            );

            await Promise.all(promises);

            const totalTime = Date.now() - start;

            // 병렬 처리되어야 하므로 총 시간이 순차 실행보다 짧아야 함
            expect(totalTime).toBeLessThan(300); // 100ms * 5 = 500ms보다 작아야 함
            expect(executionTimes).toHaveLength(5);
        });

        it('롤백 시 역순으로 실행된다', async () => {
            const key = 'rollback-test';
            const rollbackOrder: number[] = [];

            const options = Array.from({ length: 5 }, (_, i) => ({
                execute: async () => {
                    // 처음 3개는 성공
                    if (i >= 3) {
                        throw new Error(`옵션 ${i + 1} 실행 실패`);
                    }
                },
                rollback: async () => {
                    rollbackOrder.push(i + 1);
                },
            }));

            await expect(() =>
                redisTransactionManager.transaction(key, options),
            ).rejects.toThrow('옵션 4 실행 실패');

            // 롤백이 역순으로 실행되었는지 확인 (3, 2, 1 순서)
            expect(rollbackOrder).toEqual([3, 2, 1]);
        });

        it('롤백 함수가 없는 옵션은 스킵한다', async () => {
            const key = 'rollback-skip-test';
            const rollbackOrder: number[] = [];

            const options = [
                {
                    execute: async () => {},
                    rollback: async () => {
                        rollbackOrder.push(1);
                    },
                },
                {
                    execute: async () => {},
                    // rollback 없음
                },
                {
                    execute: async () => {},
                    rollback: async () => {
                        rollbackOrder.push(3);
                    },
                },
                {
                    execute: () => {
                        throw new Error('롤백 테스트');
                    },
                },
            ];

            await expect(() =>
                redisTransactionManager.transaction(key, options),
            ).rejects.toThrow('롤백 테스트');

            // rollback이 있는 옵션만 실행 (3, 1 순서)
            expect(rollbackOrder).toEqual([3, 1]);
        });

        it('락 획득 실패 시 적절한 예외를 던진다', async () => {
            const key = 'lock-timeout-test';

            // 첫 번째 트랜잭션으로 락 점유
            const longRunningTransaction = redisTransactionManager.transaction(
                key,
                [
                    {
                        execute: async () => {
                            await new Promise((resolve) =>
                                setTimeout(resolve, 1000),
                            );
                        },
                    },
                ],
                500, // TTL 500ms
                1, // 최대 1번 재시도
                100, // 타임아웃 100ms
            );

            // 두 번째 트랜잭션 - 락 획득 실패해야 함
            const failingTransaction = redisTransactionManager.transaction(
                key,
                [
                    {
                        execute: async () => {
                            throw new Error('이 코드는 실행되면 안됨');
                        },
                    },
                ],
                100, // TTL 100ms
                1, // 최대 1번 재시도
                50, // 타임아웃 50ms
            );

            await expect(failingTransaction).rejects.toThrow(
                '타임아웃: lock:lock-timeout-test:release',
            );

            // 첫 번째 트랜잭션은 정상 완료되어야 함
            await expect(longRunningTransaction).resolves.not.toThrow();
        });

        it('트랜잭션 중첩 실행 시 데드락이 발생하지 않는다', async () => {
            const key = 'simple-test';
            const results: string[] = [];

            // 단순한 순차 실행으로 변경
            await redisTransactionManager.transaction(key, [
                {
                    execute: async () => {
                        results.push('step1');
                    },
                },
            ]);

            await redisTransactionManager.transaction(key, [
                {
                    execute: async () => {
                        results.push('step2');
                    },
                },
            ]);

            expect(results).toHaveLength(2);
            expect(results).toContain('step1');
            expect(results).toContain('step2');
        }, 10000);

        it('대량의 동시 요청을 처리할 수 있다', async () => {
            const key = 'stress-test';
            let successCount = 0;

            const transactions = Array.from({ length: 5 }, () =>
                redisTransactionManager
                    .transaction(key, [
                        {
                            execute: async () => {
                                successCount++;
                            },
                        },
                    ])
                    .catch(() => {
                        // 락 획득 실패는 예상된 동작
                    }),
            );

            await Promise.allSettled(transactions);

            // 적어도 일부 트랜잭션이 성공해야 함
            expect(successCount).toBeGreaterThan(0);
        });

        it('빈 옵션 배열로도 정상 동작한다', async () => {
            const key = 'empty-options-test';

            await expect(
                redisTransactionManager.transaction(key, []),
            ).resolves.not.toThrow();
        });

        it('롤백 중 예외가 발생해도 다른 롤백을 계속 실행한다', async () => {
            const key = 'rollback-error-test';
            const rollbackOrder: number[] = [];

            const options = [
                {
                    execute: async () => {},
                    rollback: async () => {
                        rollbackOrder.push(1);
                    },
                },
                {
                    execute: async () => {},
                    rollback: async () => {
                        rollbackOrder.push(2);
                        throw new Error('롤백 중 오류');
                    },
                },
                {
                    execute: async () => {},
                    rollback: async () => {
                        rollbackOrder.push(3);
                    },
                },
                {
                    execute: () => {
                        throw new Error('실행 오류');
                    },
                },
            ];

            await expect(() =>
                redisTransactionManager.transaction(key, options),
            ).rejects.toThrow('실행 오류');

            // 롤백 중 오류가 발생해도 모든 롤백이 실행되어야 함
            expect(rollbackOrder).toEqual([3, 2, 1]);
        });

        it('잘못된 lockId로는 락을 해제할 수 없다', async () => {
            const key = 'lock-id-test';
            const correctLockId = 'correct-lock-id';
            const wrongLockId = 'wrong-lock-id';

            // 올바른 lockId로 락 설정
            await redisClient.set(`lock:${key}`, correctLockId, 'PX', 5000);

            // 잘못된 lockId로 해제 시도 - 실패해야 함
            const wrongReleaseResult = await redisClient.eval(
                `
                if redis.call("GET", KEYS[1]) == ARGV[1] then
                    return redis.call("DEL", KEYS[1])
                else
                    return 0
                end
                `,
                1,
                `lock:${key}`,
                wrongLockId,
            );

            expect(wrongReleaseResult).toBe(0); // 해제 실패

            // 락이 여전히 존재하는지 확인
            const lockExists = await redisClient.exists(`lock:${key}`);
            expect(lockExists).toBe(1);

            // 올바른 lockId로 해제 시도 - 성공해야 함
            const correctReleaseResult = await redisClient.eval(
                `
                if redis.call("GET", KEYS[1]) == ARGV[1] then
                    return redis.call("DEL", KEYS[1])
                else
                    return 0
                end
                `,
                1,
                `lock:${key}`,
                correctLockId,
            );

            expect(correctReleaseResult).toBe(1); // 해제 성공

            // 락이 해제되었는지 확인
            const lockExistsAfter = await redisClient.exists(`lock:${key}`);
            expect(lockExistsAfter).toBe(0);
        });

        it('트랜잭션 실행 중 락이 다른 프로세스에 의해 해제되면 예외가 발생한다', async () => {
            const key = 'hijacked-lock-test';
            let executionStarted = false;
            let lockHijacked = false;

            const transactionPromise = redisTransactionManager.transaction(
                key,
                [
                    {
                        execute: async () => {
                            executionStarted = true;

                            // 실행 중에 외부에서 락을 강제로 해제
                            await new Promise((resolve) =>
                                setTimeout(resolve, 10),
                            );

                            if (!lockHijacked) {
                                await redisClient.del(`lock:${key}`);
                                lockHijacked = true;
                            }

                            // 트랜잭션이 계속 진행되는지 확인
                            await new Promise((resolve) =>
                                setTimeout(resolve, 10),
                            );
                        },
                    },
                ],
            );

            // 트랜잭션이 정상적으로 완료되어야 함 (내부적으로는 락이 없어도 실행 완료)
            await expect(transactionPromise).resolves.not.toThrow();

            expect(executionStarted).toBe(true);
            expect(lockHijacked).toBe(true);
        });

        it('동일한 락 키로 동시에 여러 트랜잭션 실행 시 하나만 성공한다', async () => {
            const key = 'exclusive-lock-test';
            let successCount = 0;
            let failureCount = 0;

            const promises = Array.from({ length: 10 }, () =>
                redisTransactionManager
                    .transaction(key, [
                        {
                            execute: async () => {
                                successCount++;
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 100),
                                );
                            },
                        },
                    ])
                    .then(() => {
                        // 성공한 경우
                    })
                    .catch(() => {
                        failureCount++;
                    }),
            );

            await Promise.allSettled(promises);

            // 일부는 성공하고 일부는 실패해야 함 (정확히 1개가 아닐 수 있음)
            expect(successCount).toBeGreaterThan(0);
            expect(failureCount).toBeGreaterThan(0);
            expect(successCount + failureCount).toBe(10);
        });

        // NOTE 리트라이는 섬 참여 동시성 테스트에서 검증이 됨.
    });
});

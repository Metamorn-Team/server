import { Test, TestingModule } from '@nestjs/testing';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { RedisTransactionManager } from 'src/infrastructure/redis/redis-transaction-manager';
import { RedisTransactionManagerModule } from 'src/infrastructure/redis/redis-transaction-manger.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { DesertedIslandStorageModule } from 'src/modules/game/desert-island-storage.module';
import { PlayerStorageModule } from 'src/modules/game/player-storage.module';
import {
    generateDesertedIslandModel,
    generatePlayerModel,
} from 'test/helper/generators';

describe('IslandJoinService', () => {
    let app: TestingModule;
    let redisTransactionManager: RedisTransactionManager;
    let playerStorage: PlayerStorage;
    let desertedIslandStorage: DesertedIslandStorage;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                RedisTransactionManagerModule,
                RedisModule,
                PlayerStorageModule,
                DesertedIslandStorageModule,
            ],
        }).compile();

        redisTransactionManager = app.get<RedisTransactionManager>(
            RedisTransactionManager,
        );
        playerStorage = app.get<PlayerStorage>(PlayerStorage);
        desertedIslandStorage = app.get<DesertedIslandStorage>(
            DesertedIslandStorage,
        );
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

        // NOTE 리트라이는 섬 참여 동시성 테스트에서 검증이 됨.
    });
});

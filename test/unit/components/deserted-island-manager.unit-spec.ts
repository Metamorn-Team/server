import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { DesertedIslandManager } from 'src/domain/components/islands/deserted-storage/deserted-island-manager';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { SlotTypeEnum } from 'src/domain/types/equipment.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { DesertedIslandManagerModule } from 'src/modules/islands/deserted-island-manager.module';
import {
    generateEquipment,
    generateItem,
    generateNormalIslandModel,
    generatePlayerModel,
    generateUserEntityV2,
} from 'test/helper/generators';
import { COMMON_IMPORTS } from 'test/unit/services/commom-imports';

describe('DesertedIslandManager', () => {
    let app: TestingModule;
    let db: PrismaService;
    let redis: Redis;
    let playerStorage: PlayerStorage;
    let desertedIslandStorage: DesertedIslandStorage;

    let desertedIslandManager: DesertedIslandManager;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [DesertedIslandManagerModule, ...COMMON_IMPORTS],
        }).compile();

        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
        playerStorage = app.get<PlayerStorage>(PlayerStorage);
        desertedIslandStorage = app.get<DesertedIslandStorage>(
            DesertedIslandStorage,
        );

        desertedIslandManager = app.get<DesertedIslandManager>(
            DesertedIslandManager,
        );
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.equipment.deleteMany();
        await db.item.deleteMany();
        await db.islandJoin.deleteMany();
        await db.island.deleteMany();
        await db.user.deleteMany();
    });

    describe('활성 플레이어 조회', () => {
        // 섬 생성
        const island = generateNormalIslandModel({
            max: 5,
            type: IslandTypeEnum.NORMAL,
        });

        // 플레이어 생성
        const users = Array.from({ length: 5 }, (_, i) =>
            generateUserEntityV2({ nickname: `nick${i}`, tag: `tag${i}` }),
        );
        const players = Array.from({ length: 5 }, (_, i) =>
            generatePlayerModel({ ...users[i], roomId: island.id }),
        );

        // 아이템 및 장착 데이터 생성
        const aura = generateItem({ key: 'aura_key', name: '오라' });
        const equipments = users.map((user) =>
            generateEquipment(user.id, aura.id, SlotTypeEnum.AURA),
        );

        beforeEach(async () => {
            await desertedIslandStorage.createIsland(island);
            await db.user.createMany({ data: users });
            await db.item.create({ data: aura });
            await db.equipment.createMany({ data: equipments });

            await Promise.all(
                players.map((player) => playerStorage.addPlayer(player)),
            );
            await Promise.all(
                players.map((player) =>
                    desertedIslandStorage.addPlayerToIsland(
                        island.id,
                        player.id,
                    ),
                ),
            );
        });

        it('모든 사용자의 정보와 장비 데이터가 조회된다', async () => {
            const activePlayers = await desertedIslandManager.getActiveUsers(
                island.id,
                users[0].id,
            );

            expect(activePlayers.length).toEqual(players.length - 1);
            activePlayers.forEach((player) => {
                expect(player.equipmentState).toEqual({
                    AURA: {
                        key: aura.key,
                        name: aura.name,
                    },
                    SPEECH_BUBBLE: null,
                });
            });
        });
    });
});

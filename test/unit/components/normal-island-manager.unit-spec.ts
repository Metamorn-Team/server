import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-config';
import { NormalIslandManager } from 'src/domain/components/islands/normal-storage/normal-island-manager';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { SlotTypeEnum } from 'src/domain/types/equipment.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { NormalIslandManagerModule } from 'src/modules/islands/normal-island-manager.module';
import {
    generateEquipment,
    generateItem,
    generateNormalIslandModel,
    generatePlayerModel,
    generateUserEntityV2,
} from 'test/helper/generators';

describe('NormalIslandManager', () => {
    let app: TestingModule;
    let db: PrismaService;
    let redis: Redis;
    let playerStorage: PlayerStorage;
    let normalIslandStorage: NormalIslandStorage;

    let normalIslandManager: NormalIslandManager;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                NormalIslandManagerModule,
                PrismaModule,
                ClsModule.forRoot(clsOptions),
            ],
        }).compile();

        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
        playerStorage = app.get<PlayerStorage>(PlayerStorage);
        normalIslandStorage = app.get<NormalIslandStorage>(NormalIslandStorage);

        normalIslandManager = app.get<NormalIslandManager>(NormalIslandManager);
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
            await normalIslandStorage.createIsland(island);
            await db.user.createMany({ data: users });
            await db.item.create({ data: aura });
            await db.equipment.createMany({ data: equipments });

            await Promise.all(
                players.map((player) => playerStorage.addPlayer(player)),
            );
            await Promise.all(
                players.map((player) =>
                    normalIslandStorage.addPlayerToIsland(island.id, player.id),
                ),
            );
        });

        it('모든 사용자의 정보와 장비 데이터가 조회된다', async () => {
            const activePlayers = await normalIslandManager.getActiveUsers(
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

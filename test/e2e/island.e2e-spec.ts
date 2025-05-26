import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import Redis from 'ioredis';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import {
    generateNormalIslandModel,
    generatePlayerModel,
    generateUserEntityV2,
} from 'test/helper/generators';
import { login } from 'test/helper/login';
import { ResponseResult } from 'test/helper/types';
import { GetIslandDetailResponse } from 'src/presentation/dto/island/response/get-island-detail.response';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let db: PrismaService;
    let redis: Redis;
    let normalIslandStorage: NormalIslandStorage;
    let playerMemoryStrorage: PlayerMemoryStorage;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
        normalIslandStorage = app.get<NormalIslandStorage>(NormalIslandStorage);
        playerMemoryStrorage =
            app.get<PlayerMemoryStorage>(PlayerMemoryStorage);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.island.deleteMany();
        await db.user.deleteMany();
    });

    describe('GET /islands/:id - 섬 상세 조회', () => {
        const user = generateUserEntityV2();
        const island = generateNormalIslandModel({ ownerId: user.id });
        const player = generatePlayerModel({
            id: user.id,
            nickname: user.nickname,
            roomId: island.id,
        });

        beforeEach(async () => {
            await db.user.create({ data: user });
            await normalIslandStorage.createIsland(island);
            playerMemoryStrorage.addPlayer(player);
        });

        it('섬 조회 정상 동작', async () => {
            const { accessToken } = await login(app);

            const response = (await request(app.getHttpServer())
                .get(`/islands/${island.id}`)
                .set(
                    'Authorization',
                    accessToken,
                )) as ResponseResult<GetIslandDetailResponse>;
            const { body, status } = response;

            const expected: GetIslandDetailResponse = {
                id: island.id,
                name: island.name,
                description: island.description,
                coverImage: island.coverImage,
                maxMembers: island.max,
                tags: island.tags,
                owner: {
                    id: island.ownerId,
                    nickname: user.nickname,
                },
            };

            expect(status).toBe(200);
            expect(body).toEqual(expected);
        });
    });
});

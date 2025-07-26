/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { login } from 'test/helper/login';
import { CreatePrivateIslandRequest } from 'src/presentation/dto/island/request/create-private-island.request';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { v4 } from 'uuid';
import { CreatePrivateIslandResponse } from 'src/presentation/dto/island/response/create-private-island.response';
import { ResponseResult } from 'test/helper/types';
import Redis from 'ioredis';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { LivePrivateIslandReader } from 'src/domain/components/islands/live-private-island-reader';

describe('PrivateIslandController (e2e)', () => {
    let app: INestApplication;
    let db: PrismaService;
    let redis: Redis;
    let livePrivateIslandReader: LivePrivateIslandReader;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        db = app.get(PrismaService);
        redis = app.get(RedisClientService).getClient();
        livePrivateIslandReader = app.get(LivePrivateIslandReader);

        await app.init();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.privateIsland.deleteMany();
        await db.map.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/private-island (POST)', () => {
        it('친구 섬 생성 성공', async () => {
            const { accessToken } = await login(app);

            const map = await db.map.create({
                data: {
                    id: v4(),
                    description: '테스트 맵',
                    image: 'https://example.com/image.jpg',
                    key: 'test-map',
                    name: '테스트 맵',
                    createdAt: new Date(),
                },
            });

            const dto: CreatePrivateIslandRequest = {
                isPublic: true,
                mapKey: map.key,
                name: '테스트 친구섬',
                coverImage: 'https://example.com/cover.jpg',
                description: '테스트 설명',
                password: 'password123',
            };

            const response = await request(app.getHttpServer())
                .post('/private-island')
                .set('Authorization', accessToken)
                .send(dto);

            const {
                status,
                body,
            }: ResponseResult<CreatePrivateIslandResponse> = response;

            const island = (await db.privateIsland.findMany())[0];
            const liveIsland = await livePrivateIslandReader.readOne(island.id);

            expect(status).toBe(200);
            expect(body.id).toBeDefined();
            expect(body.urlPath).toBeDefined();
            expect(liveIsland).toBeDefined();
        });
    });
});

/* eslint-disable @typescript-eslint/no-unsafe-argument */
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

import { generatePrivateIsland } from 'test/helper/generators';
import { GetPrivateIslandListResponse } from 'src/presentation/dto/island/response/get-private-island-list.response';
import { GetMyPrivateIslandRequest } from 'src/presentation/dto/island/request/get-my-private-island.request';
import { PrivateIslandEntity } from 'src/domain/entities/islands/private-island.entity';

describe('PrivateIslandController (e2e)', () => {
    let app: INestApplication;
    let db: PrismaService;
    let redis: Redis;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        db = app.get(PrismaService);
        redis = app.get(RedisClientService).getClient();

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

    describe('/private-islands (POST)', () => {
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
                .post('/private-islands')
                .set('Authorization', accessToken)
                .send(dto);

            const {
                status,
                body,
            }: ResponseResult<CreatePrivateIslandResponse> = response;

            expect(status).toBe(200);
            expect(body.id).toBeDefined();
            expect(body.urlPath).toBeDefined();
        });
    });

    describe('(GET) /private-islands/my', () => {
        let authToken: string;
        let islands: PrivateIslandEntity[];

        beforeEach(async () => {
            const { accessToken, userId } = await login(app);
            authToken = accessToken;

            const map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'test-map',
                    createdAt: new Date(),
                    description: '테스트 맵',
                    image: 'https://example.com/image.jpg',
                    name: '테스트 맵',
                },
            });
            islands = Array.from({ length: 10 }).map((_, i) =>
                generatePrivateIsland(map.id, userId, {
                    name: `테스트 섬 ${i}`,
                    createdAt: new Date(Date.now() - i * 1000),
                }),
            );

            await db.privateIsland.createMany({ data: islands });
        });

        it('내 섬 조회 생성일 기준 내림차순 조회 성공', async () => {
            const dto: GetMyPrivateIslandRequest = {
                limit: 20,
                order: 'desc',
                page: 1,
                sortBy: 'createdAt',
            };
            const response = await request(app.getHttpServer())
                .get('/private-islands/my')
                .query(dto)
                .set('Authorization', authToken);

            const {
                status,
                body,
            }: ResponseResult<GetPrivateIslandListResponse> = response;

            const expectedIslands = islands.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            );

            expect(status).toBe(200);
            expect(body.islands.length).toBe(10);
            expectedIslands.forEach((island, i) => {
                expect(island.id).toEqual(body.islands[i].id);
            });
        });

        it('삭제된 섬은 조회되지 않는다', async () => {
            // Given: 첫 번째 섬을 삭제 처리
            const targetIsland = islands[0];
            await db.privateIsland.update({
                where: { id: targetIsland.id },
                data: { deletedAt: new Date() },
            });

            // When: 내 섬 목록을 조회
            const dto: GetMyPrivateIslandRequest = {
                limit: 20,
                order: 'desc',
                page: 1,
                sortBy: 'createdAt',
            };
            const response = await request(app.getHttpServer())
                .get('/private-islands/my')
                .query(dto)
                .set('Authorization', authToken);

            const {
                status,
                body,
            }: ResponseResult<GetPrivateIslandListResponse> = response;

            // Then: 삭제된 섬은 결과에 포함되지 않아야 함
            expect(status).toBe(200);
            expect(body.islands.length).toBe(9); // 10개 중 1개가 삭제되어 9개

            // 삭제된 섬의 ID가 결과에 포함되지 않았는지 확인
            const returnedIslandIds = body.islands.map((island) => island.id);
            expect(returnedIslandIds).not.toContain(targetIsland.id);
        });

        it('여러 섬이 삭제된 경우 모두 조회에서 제외된다', async () => {
            // Given: 처음 3개 섬을 삭제 처리
            const deletedIslands = islands.slice(0, 3);
            await db.privateIsland.updateMany({
                where: {
                    id: {
                        in: deletedIslands.map((island) => island.id),
                    },
                },
                data: { deletedAt: new Date() },
            });

            // When: 내 섬 목록을 조회
            const dto: GetMyPrivateIslandRequest = {
                limit: 20,
                order: 'desc',
                page: 1,
                sortBy: 'createdAt',
            };
            const response = await request(app.getHttpServer())
                .get('/private-islands/my')
                .query(dto)
                .set('Authorization', authToken);

            const {
                status,
                body,
            }: ResponseResult<GetPrivateIslandListResponse> = response;

            // Then: 삭제된 섬들은 모두 결과에 포함되지 않아야 함
            expect(status).toBe(200);
            expect(body.islands.length).toBe(7); // 10개 중 3개가 삭제되어 7개

            // 삭제된 섬들의 ID가 결과에 포함되지 않았는지 확인
            const returnedIslandIds = body.islands.map((island) => island.id);
            deletedIslands.forEach((deletedIsland) => {
                expect(returnedIslandIds).not.toContain(deletedIsland.id);
            });
        });
    });

    describe('(POST) /private-islands/:id/password', () => {
        let authToken: string;
        let privateIsland: PrivateIslandEntity;
        let map: { id: string; key: string };

        beforeEach(async () => {
            const { accessToken, userId } = await login(app);
            authToken = accessToken;

            map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'test-map',
                    createdAt: new Date(),
                    description: '테스트 맵',
                    image: 'https://example.com/image.jpg',
                    name: '테스트 맵',
                },
            });

            privateIsland = generatePrivateIsland(map.id, userId, {
                name: '비밀번호가 있는 섬',
                password: 'testPassword123',
                isPublic: false,
            });

            await db.privateIsland.create({ data: privateIsland });
        });

        it('비밀번호 확인 성공', async () => {
            const response = await request(app.getHttpServer())
                .post(`/private-islands/${privateIsland.id}/password`)
                .set('Authorization', authToken)
                .send({ password: 'testPassword123' });

            expect(response.status).toBe(204);
        });

        it('잘못된 비밀번호로 인한 확인 실패', async () => {
            const response = await request(app.getHttpServer())
                .post(`/private-islands/${privateIsland.id}/password`)
                .set('Authorization', authToken)
                .send({ password: 'wrongPassword' });

            expect(response.status).toBe(403);
        });

        it('존재하지 않는 섬 ID로 비밀번호 확인 시도 시 실패', async () => {
            const nonExistentId = v4();
            const response = await request(app.getHttpServer())
                .post(`/private-islands/${nonExistentId}/password`)
                .set('Authorization', authToken)
                .send({ password: 'testPassword123' });

            expect(response.status).toBe(404);
        });

        it('비밀번호가 없는 섬에 대해 비밀번호 확인 시도 시 항상 성공', async () => {
            const noPasswordIsland = generatePrivateIsland(
                map.id,
                privateIsland.ownerId,
                {
                    name: '비밀번호가 없는 섬',
                    isPublic: true,
                },
            );

            await db.privateIsland.create({ data: noPasswordIsland });

            const response = await request(app.getHttpServer())
                .post(`/private-islands/${noPasswordIsland.id}/password`)
                .set('Authorization', authToken)
                .send({ password: 'anyPassword' });

            expect(response.status).toBe(204);
        });

        it('빈 비밀번호로 확인 시도 시 실패', async () => {
            const response = await request(app.getHttpServer())
                .post(`/private-islands/${privateIsland.id}/password`)
                .set('Authorization', authToken)
                .send({ password: '' });

            expect(response.status).toBe(400);
        });

        it('비밀번호 필드가 누락된 요청 시 실패', async () => {
            const response = await request(app.getHttpServer())
                .post(`/private-islands/${privateIsland.id}/password`)
                .set('Authorization', authToken)
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /private-islands/:id - 비밀섬 삭제', () => {
        let authToken: string;
        let userId: string;
        let otherAuthToken: string;
        let map: { id: string; key: string };
        let privateIsland: PrivateIslandEntity;

        beforeEach(async () => {
            const loginResult = await login(app);
            authToken = loginResult.accessToken;
            userId = loginResult.userId;

            const otherLoginResult = await login(app);
            otherAuthToken = otherLoginResult.accessToken;

            map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'test-map',
                    createdAt: new Date(),
                    description: '테스트 맵',
                    image: 'https://example.com/image.jpg',
                    name: '테스트 맵',
                },
            });

            const privateIslandData = generatePrivateIsland(map.id, userId, {
                name: '삭제할 섬',
                isPublic: true,
                description: '삭제 테스트용 섬',
            });

            privateIsland = await db.privateIsland.create({
                data: privateIslandData,
            });
        });

        it('정상 동작', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/private-islands/${privateIsland.id}`)
                .set('Authorization', authToken);

            expect(response.status).toBe(204);

            // soft delete되어 deletedAt이 설정되었는지 확인
            const deletedIsland = await db.privateIsland.findUnique({
                where: { id: privateIsland.id },
            });
            expect(deletedIsland).not.toBeNull();
            expect(deletedIsland?.deletedAt).not.toBeNull();
        });

        it('섬의 주인이 아닌 회원이 삭제를 시도하는 경우 예외가 발생한다', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/private-islands/${privateIsland.id}`)
                .set('Authorization', otherAuthToken);

            expect(response.status).toBe(403);

            // 섬이 삭제되지 않았는지 확인 (deletedAt이 null인지 확인)
            const existingIsland = await db.privateIsland.findUnique({
                where: { id: privateIsland.id },
            });
            expect(existingIsland).not.toBeNull();
            expect(existingIsland?.id).toBe(privateIsland.id);
            expect(existingIsland?.deletedAt).toBeNull();
        });

        it('존재하지 않는 섬을 삭제 시도 시 예외가 발생한다', async () => {
            const nonExistentIslandId = v4();

            const response = await request(app.getHttpServer())
                .delete(`/private-islands/${nonExistentIslandId}`)
                .set('Authorization', authToken);

            expect(response.status).toBe(404);
        });

        it('인증 없이 삭제 요청 시 예외가 발생한다', async () => {
            const response = await request(app.getHttpServer()).delete(
                `/private-islands/${privateIsland.id}`,
            );

            expect(response.status).toBe(401);
        });

        it('잘못된 UUID 형식의 ID로 삭제 시도 시 예외가 발생한다', async () => {
            const invalidId = 'invalid-uuid';

            const response = await request(app.getHttpServer())
                .delete(`/private-islands/${invalidId}`)
                .set('Authorization', authToken);

            expect(response.status).toBe(400);
        });
    });
});

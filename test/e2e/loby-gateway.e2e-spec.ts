/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { generateNormalIslandModel, generateTag } from 'test/helper/generators';
import Redis from 'ioredis';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import {
    createSocketConnection,
    TypedSockect,
    waitForEvent,
} from 'test/helper/socket';
import {
    CreateIslandRequest,
    CanJoinIslandRequest,
    CanJoinIslandResponse,
    CreatedIslandResponse,
    GetLiveIslandListResponse,
    WsErrorBody,
    WsExceptions,
} from 'src/presentation/dto';
import { v4 } from 'uuid';
import { Map } from '@prisma/client';

describe('LobyGateway (e2e)', () => {
    let app: INestApplication;
    let normalIslandStorage: NormalIslandStorage;
    let db: PrismaService;
    let redis: Redis;
    let socket: TypedSockect;
    const serverPort = 8081;
    const url = `http://localhost:${serverPort}/island`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        await app.listen(serverPort);

        normalIslandStorage = app.get<NormalIslandStorage>(NormalIslandStorage);
        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();

        socket = await createSocketConnection(url, app);
    });

    afterEach(async () => {
        await redis.flushall();
        await db.refreshToken.deleteMany();
        await db.islandTag.deleteMany();
        await db.playerSpawnPoint.deleteMany();
        await db.island.deleteMany();
        await db.map.deleteMany();
        await db.tag.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        socket.disconnect();
        await app.close();
    });

    describe('섬 생성', () => {
        const tag = generateTag('자유');
        let map: Map;

        beforeEach(async () => {
            await db.tag.create({ data: tag });
            map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'island',
                    name: '섬',
                    description: '섬 설명',
                    image: 'https://example.com/image.png',
                    createdAt: new Date(),
                },
            });
        });

        it('섬 생성 정상 동작', async () => {
            const dto: CreateIslandRequest = {
                coverImage: 'https://example.com/image.png',
                description: '섬 설명',
                maxMembers: 5,
                name: '섬 이름',
                tags: [tag.name],
                mapKey: map.key,
            };
            socket.emit('createIsland', dto);

            const response = await waitForEvent<CreatedIslandResponse>(
                socket,
                'createdIsland',
            );

            const island = await normalIslandStorage.getIsland(
                response.islandId,
            );
            expect(island?.name).toEqual(dto.name);
            expect(island?.description).toEqual(dto.description);
            expect(island?.max).toEqual(dto.maxMembers);
            expect(island?.coverImage).toEqual(dto.coverImage);
            expect(island?.tags).toEqual([tag.name]);
            expect(island?.type).toEqual(IslandTypeEnum.NORMAL);
            expect(island?.players.size).toEqual(0);
        });

        it('mapKey가 없는 경우 섬 생성 실패', async () => {
            const dto = {
                coverImage: 'https://example.com/image.png',
                description: '섬 설명',
                maxMembers: 5,
                name: '섬 이름',
                tags: [tag.name],
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });

        it('name이 없는 경우 섬 생성 실패', async () => {
            const dto = {
                coverImage: 'https://example.com/image.png',
                description: '섬 설명',
                maxMembers: 5,
                tags: [tag.name],
                mapKey: map.key,
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });

        it('description이 없는 경우 섬 생성 실패', async () => {
            const dto = {
                coverImage: 'https://example.com/image.png',
                maxMembers: 5,
                name: '섬 이름',
                tags: [tag.name],
                mapKey: map.key,
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });

        it('maxMembers가 없는 경우 섬 생성 실패', async () => {
            const dto = {
                coverImage: 'https://example.com/image.png',
                description: '섬 설명',
                name: '섬 이름',
                tags: [tag.name],
                mapKey: map.key,
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });

        it('maxMembers가 5보다 큰 경우 섬 생성 실패', async () => {
            const dto = {
                coverImage: 'https://example.com/image.png',
                description: '섬 설명',
                name: '섬 이름',
                maxMembers: 6,
                tags: [tag.name],
                mapKey: map.key,
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });

        it('maxMembers가 1보다 작은 경우 섬 생성 실패', async () => {
            const dto = {
                coverImage: 'https://example.com/image.png',
                description: '섬 설명',
                name: '섬 이름',
                maxMembers: 0,
                tags: [tag.name],
                mapKey: map.key,
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });

        it('coverImage가 없는 경우 섬 생성 실패', async () => {
            const dto = {
                description: '섬 설명',
                maxMembers: 5,
                name: '섬 이름',
                tags: [tag.name],
                mapKey: map.key,
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });

        it('tags가 없는 경우 섬 생성 실패', async () => {
            const dto = {
                coverImage: 'https://example.com/image.png',
                description: '섬 설명',
                maxMembers: 5,
                name: '섬 이름',
                mapKey: map.key,
            };
            socket.emit('createIsland', dto as CreateIslandRequest);

            const response = await waitForEvent<WsErrorBody>(socket, 'wsError');

            expect(response.name).toEqual(WsExceptions.BAD_INPUT);
        });
    });

    describe('섬 참여 가능 여부 확인', () => {
        it('참여 가능한 경우', async () => {
            const island = generateNormalIslandModel({ max: 5 });
            await normalIslandStorage.createIsland(island);

            const dto: CanJoinIslandRequest = {
                islandId: island.id,
            };
            socket.emit('canJoinIsland', dto);

            const response = await waitForEvent<CanJoinIslandResponse>(
                socket,
                'canJoinIsland',
            );

            expect(response.canJoin).toEqual(true);
            expect(response.islandId).toEqual(island.id);
        });

        it('참여 불가능한 경우', async () => {
            const island = generateNormalIslandModel({ max: 0 });
            await normalIslandStorage.createIsland(island);

            const dto: CanJoinIslandRequest = {
                islandId: island.id,
            };
            socket.emit('canJoinIsland', dto);

            const response = await waitForEvent<CanJoinIslandResponse>(
                socket,
                'canJoinIsland',
            );

            expect(response.canJoin).toEqual(false);
        });
    });

    describe('활성 일반 섬 조회', () => {
        const islands = Array.from({ length: 10 }, (_, i) =>
            generateNormalIslandModel({
                name: `섬 ${i + 1}`,
            }),
        );

        beforeEach(async () => {
            for (const island of islands) {
                await normalIslandStorage.createIsland(island);
            }
        });

        it('활성 일반 섬 조회 정상 동작', async () => {
            socket.emit('getActiveIslands', {
                page: 1,
                limit: 10,
            });

            const response = await waitForEvent<GetLiveIslandListResponse>(
                socket,
                'getActiveIslands',
            );

            expect(response.islands.length).toEqual(islands.length);
        });
    });
});

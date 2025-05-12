import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import {
    LiveDesertedIsland,
    LiveNormalIsland,
} from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { v4 } from 'uuid';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { generateIsland } from 'test/helper/generators';
import Redis from 'ioredis';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import {
    createSocketConnection,
    TypedSockect,
} from 'test/helper/socket-connect';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';

describe('IslandGateway (e2e)', () => {
    let app: INestApplication;
    let normalIslandStorage: NormalIslandStorage;
    let desertedIslandStorage: DesertedIslandStorage;
    let db: PrismaService;
    let redis: Redis;
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
        desertedIslandStorage = app.get<DesertedIslandStorage>(
            DesertedIslandStorage,
        );
        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.islandJoin.deleteMany();
        await db.island.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('일반 섬 입장', () => {
        it('동시에 여러 회원이 입장을 요청해도 최대 인원 이상 참여되지 않는다. (Race condition)', async () => {
            const island: LiveNormalIsland = {
                id: v4(),
                coverImage: 'http://test.com',
                createdAt: new Date(),
                description: '섬입니다',
                max: 3,
                name: '섬',
                players: new Set<string>(),
                tags: ['자유'],
                type: IslandTypeEnum.NORMAL,
            };
            await normalIslandStorage.createIsland(island.id, island);
            await db.island.create({
                data: generateIsland({
                    id: island.id,
                    coverImage: island.coverImage,
                    createdAt: island.createdAt,
                    description: island.description,
                    maxMembers: island.max,
                    name: island.name,
                    type: island.type,
                }),
            });

            const clients = await Promise.all(
                Array.from({ length: 20 }).map(() =>
                    createSocketConnection(url, app),
                ),
            );

            await new Promise((res) => setTimeout(res, 500));

            let success = 0;
            let fail = 0;

            await Promise.all(
                clients.map((socket: TypedSockect) => {
                    return new Promise<void>((res) => {
                        socket.on('playerJoinSuccess', () => {
                            success += 1;
                            res();
                        });

                        socket.on('wsError', (_) => {
                            fail += 1;
                            res();
                        });

                        socket.emit('joinNormalIsland', {
                            x: 0,
                            y: 0,
                            islandId: island.id,
                        });
                    });
                }),
            );

            clients.forEach((socket) => {
                socket.disconnect();
            });

            expect(success).toEqual(3);
            expect(fail).toEqual(clients.length - 3);
        }, 10000);
    });

    describe('무인도 입장', () => {
        it('동시에 여러 회원이 입장을 요청해도 최대 인원 이상 참여되지 않는다. (Race condition)', async () => {
            const island: LiveDesertedIsland = {
                id: v4(),
                max: 3,
                players: new Set<string>(),
                type: IslandTypeEnum.DESERTED,
            };
            await desertedIslandStorage.createIsland(island.id, island);
            await db.island.create({
                data: generateIsland({
                    id: island.id,
                    maxMembers: island.max,
                    type: island.type,
                }),
            });

            const clients = await Promise.all(
                Array.from({ length: 20 }).map(() =>
                    createSocketConnection(url, app),
                ),
            );

            await new Promise((res) => setTimeout(res, 500));

            let success = 0;
            let fail = 0;

            await Promise.all(
                clients.map((socket: TypedSockect) => {
                    return new Promise<void>((res) => {
                        socket.on('playerJoinSuccess', () => {
                            success += 1;
                            res();
                        });

                        socket.on('wsError', (_) => {
                            fail += 1;
                            res();
                        });

                        socket.emit('joinDesertedIsland', {
                            x: 0,
                            y: 0,
                        });
                    });
                }),
            );

            clients.forEach((socket) => {
                socket.disconnect();
            });

            expect(success).toEqual(3);
            expect(fail).toEqual(clients.length - 3);
        }, 10000);
    });
});

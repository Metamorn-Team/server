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
import { createSocketConnection, TypedSockect } from 'test/helper/socket';
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
        await db.refreshToken.deleteMany();
        await db.islandTag.deleteMany();
        await db.playerSpawnPoint.deleteMany();
        await db.map.deleteMany();
        await db.islandJoin.deleteMany();
        await db.island.deleteMany();
        await db.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('일반 섬 입장', () => {
        it('동시에 여러 회원이 입장을 요청해도 최대 인원 이상 참여되지 않는다. (Race condition)', async () => {
            const map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'island',
                    name: '섬',
                    description: '섬 설명',
                    image: 'https://example.com/image.png',
                    createdAt: new Date(),
                },
            });
            await db.playerSpawnPoint.create({
                data: {
                    id: v4(),
                    mapId: map.id,
                    x: 0,
                    y: 0,
                    createdAt: new Date(),
                },
            });

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
                ownerId: v4(),
                mapKey: map.key,
            };
            await normalIslandStorage.createIsland(island);

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
            const map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'island',
                    name: '섬',
                    description: '섬 설명',
                    image: 'https://example.com/image.png',
                    createdAt: new Date(),
                },
            });
            await db.playerSpawnPoint.create({
                data: {
                    id: v4(),
                    mapId: map.id,
                    x: 0,
                    y: 0,
                    createdAt: new Date(),
                },
            });

            const island: LiveDesertedIsland = {
                id: v4(),
                max: 3,
                players: new Set<string>(),
                type: IslandTypeEnum.DESERTED,
                mapKey: map.key,
            };
            await desertedIslandStorage.createIsland(island);
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

                        socket.emit('joinDesertedIsland');
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

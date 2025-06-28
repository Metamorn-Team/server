import { Test, TestingModule } from '@nestjs/testing';
import { IslandActiveObjectSpawner } from 'src/domain/components/island-spawn-object/island-active-object-spawner';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';
import { RespawnQueueManager } from 'src/domain/components/island-spawn-object/respawn-queue-manager';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { RespawnQueueManagerModule } from 'src/modules/island-spawn-objects/respawn-queue-manager.module';
import { SpawnZoneModule } from 'src/modules/spawn-zone/spawn-zone.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { generateActiveObject } from 'test/helper/generators';
import {
    ActiveObject,
    ObjectStatus,
} from 'src/domain/types/spawn-object/active-object';
import { v4 } from 'uuid';

describe('IslandActiveObjectSpawner', () => {
    let app: TestingModule;
    let islandActiveObjectSpawner: IslandActiveObjectSpawner;
    let islandActiveObjectWriter: IslandActiveObjectWriter;
    let islandActiveObjectReader: IslandActiveObjectReader;
    let respawnQueueManager: RespawnQueueManager;
    let db: PrismaService;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                PrismaModule,
                SpawnZoneModule,
                IslandActiveObjectComponentModule,
                RespawnQueueManagerModule,
            ],
            providers: [IslandActiveObjectSpawner],
        }).compile();

        islandActiveObjectSpawner = app.get<IslandActiveObjectSpawner>(
            IslandActiveObjectSpawner,
        );
        islandActiveObjectWriter = app.get<IslandActiveObjectWriter>(
            IslandActiveObjectWriter,
        );
        islandActiveObjectReader = app.get<IslandActiveObjectReader>(
            IslandActiveObjectReader,
        );
        respawnQueueManager = app.get<RespawnQueueManager>(RespawnQueueManager);
        db = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    afterEach(async () => {
        // 메모리 스토리지 정리
        respawnQueueManager.clear();

        // DB 정리
        await db.spawnZone.deleteMany();
        await db.spawnObject.deleteMany();
        await db.map.deleteMany();
    });

    describe('초기 오브젝트 스폰', () => {
        const islandId = v4();
        let mapId: string;

        beforeEach(async () => {
            // 맵 생성
            const map = await db.map.create({
                data: {
                    id: v4(),
                    key: 'test-map',
                    name: '테스트 맵',
                    description: '테스트용 맵',
                    image: 'https://example.com/image.png',
                    createdAt: new Date(),
                },
            });
            mapId = map.id;

            // 스폰 오브젝트 생성
            const spawnObject1 = await db.spawnObject.create({
                data: {
                    id: v4(),
                    name: '나무',
                    type: 'TREE',
                    maxHp: 100,
                    respawnTime: 10,
                    createdAt: new Date(),
                },
            });

            const spawnObject2 = await db.spawnObject.create({
                data: {
                    id: v4(),
                    name: '큰 나무',
                    type: 'TREE_TALL',
                    maxHp: 150,
                    respawnTime: 15,
                    createdAt: new Date(),
                },
            });

            // 스폰 존 생성
            await db.spawnZone.createMany({
                data: [
                    {
                        id: v4(),
                        mapId,
                        spawnObjectId: spawnObject1.id,
                        gridX: 1,
                        gridY: 1,
                        createdAt: new Date(),
                    },
                    {
                        id: v4(),
                        mapId,
                        spawnObjectId: spawnObject2.id,
                        gridX: 2,
                        gridY: 2,
                        createdAt: new Date(),
                    },
                ],
            });
        });

        it('맵 ID에 해당하는 스폰 존에서 오브젝트들을 생성한다', async () => {
            const spawnedObjects =
                await islandActiveObjectSpawner.spawnInitialObjects(
                    islandId,
                    mapId,
                );

            expect(spawnedObjects.length).toEqual(2);
            expect(spawnedObjects[0].islandId).toEqual(islandId);
            expect(spawnedObjects[0].type).toEqual('TREE');
            expect(spawnedObjects[0].maxHp).toEqual(100);
            expect(spawnedObjects[0].respawnTime).toEqual(10);
            expect(spawnedObjects[1].type).toEqual('TREE_TALL');
            expect(spawnedObjects[1].maxHp).toEqual(150);
            expect(spawnedObjects[1].respawnTime).toEqual(15);

            // 생성된 오브젝트들이 저장소에 저장되었는지 확인
            const storedObjects = islandActiveObjectReader.readAll(islandId);
            expect(storedObjects.length).toEqual(2);
        });
    });

    describe('오브젝트 리스폰', () => {
        const islandId = v4();
        let deadObject1: ActiveObject;
        let deadObject2: ActiveObject;

        beforeEach(() => {
            // 죽은 오브젝트들 생성
            deadObject1 = generateActiveObject(islandId, {
                id: v4(),
                type: 'TREE',
                hp: 0,
                status: ObjectStatus.DEAD,
            });
            deadObject2 = generateActiveObject(islandId, {
                id: v4(),
                type: 'TREE_TALL',
                hp: 0,
                status: ObjectStatus.DEAD,
            });

            islandActiveObjectWriter.createMany([deadObject1, deadObject2]);

            // 리스폰 큐에 추가
            const now = Date.now();
            respawnQueueManager.addMany([
                {
                    objectId: deadObject1.id,
                    islandId,
                    respawnTime: now - 1000, // 과거 시간 (리스폰 준비됨)
                },
                {
                    objectId: deadObject2.id,
                    islandId,
                    respawnTime: now + 1000, // 미래 시간 (리스폰 준비 안됨)
                },
            ]);
        });

        it('리스폰 시간이 된 오브젝트들을 부활시킨다', () => {
            const respawnedObjects = islandActiveObjectSpawner.respawn();

            expect(respawnedObjects.length).toEqual(1);
            expect(respawnedObjects[0].id).toEqual(deadObject1.id);
            expect(respawnedObjects[0].status).toEqual(ObjectStatus.ALIVE);
            expect(respawnedObjects[0].hp).toEqual(deadObject1.maxHp);

            // 리스폰 시간이 되지 않은 오브젝트는 부활하지 않음
            const allObjects = islandActiveObjectReader.readAll(islandId);
            const notRespawnedObject = allObjects.find(
                (obj) => obj.id === deadObject2.id,
            );
            expect(notRespawnedObject?.status).toEqual(ObjectStatus.DEAD);
        });

        it('존재하지 않는 오브젝트에 대해서는 에러를 로깅하고 계속 진행한다', () => {
            // 존재하지 않는 오브젝트 ID를 큐에 추가
            const nonExistentObjectId = v4();
            respawnQueueManager.addMany([
                {
                    objectId: nonExistentObjectId,
                    islandId,
                    respawnTime: Date.now() - 1000,
                },
            ]);

            // 에러가 발생해도 다른 오브젝트는 정상적으로 리스폰됨
            const respawnedObjects = islandActiveObjectSpawner.respawn();

            expect(respawnedObjects.length).toEqual(1);
            expect(respawnedObjects[0].id).toEqual(deadObject1.id);
        });
    });

    describe('리스폰 등록', () => {
        const islandId = v4();
        let objects: ActiveObject[];

        beforeEach(() => {
            objects = [
                generateActiveObject(islandId, {
                    id: v4(),
                    type: 'TREE',
                    respawnTime: 10,
                }),
                generateActiveObject(islandId, {
                    id: v4(),
                    type: 'TREE_TALL',
                    respawnTime: 15,
                }),
            ];

            islandActiveObjectWriter.createMany(objects);
        });

        it('같은 섬의 오브젝트들만 등록한다', () => {
            const differentIslandObject = generateActiveObject(
                'different-island',
                {
                    id: v4(),
                    type: 'TREE',
                    respawnTime: 10,
                },
            );

            const mixedObjects = [...objects, differentIslandObject];
            const now = new Date();

            // 에러가 발생하지 않아야 함 (첫 번째 오브젝트의 islandId를 기준으로 함)
            expect(() =>
                islandActiveObjectSpawner.registerForRespawn(mixedObjects, now),
            ).not.toThrow();

            // 원래 섬의 큐 아이템만 확인
            const queueItems = respawnQueueManager.getByIslandId(islandId);
            expect(queueItems.length).toEqual(2);
        });
    });
});

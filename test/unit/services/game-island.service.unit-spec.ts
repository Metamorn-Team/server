import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Map } from '@prisma/client';
import Redis from 'ioredis';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-config';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { DesertedIslandManager } from 'src/domain/components/islands/deserted-storage/deserted-island-manager';
import { NormalIslandManager } from 'src/domain/components/islands/normal-storage/normal-island-manager';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';
import { GameIslandServiceModule } from 'src/modules/game/game-island.service.module';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import {
    generateActiveObject,
    generateDesertedIslandModel,
    generateIsland,
    generateNormalIslandModel,
    generatePlayerModel,
    generateUserEntityV2,
} from 'test/helper/generators';
import { v4 } from 'uuid';
import { RespawnQueueManager } from 'src/domain/components/island-spawn-object/respawn-queue-manager';

describe('GameIslandService', () => {
    let app: TestingModule;
    let db: PrismaService;
    let redis: Redis;
    let playerMemoryStorage: PlayerMemoryStorage;
    let normalIslandStorage: NormalIslandStorage;
    let desertedIslandStorage: DesertedIslandStorage;
    let gameIslandService: GameIslandService;

    let islandActiveObjectReader: IslandActiveObjectReader;
    let islandActiveObjectWriter: IslandActiveObjectWriter;
    let respawnQueueManager: RespawnQueueManager;

    let normalIslandManager: NormalIslandManager;
    let desertedIslandManager: DesertedIslandManager;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                GameIslandServiceModule,
                PrismaModule,
                ClsModule.forRoot(clsOptions),
                IslandActiveObjectComponentModule,
            ],
        }).compile();

        db = app.get<PrismaService>(PrismaService);
        redis = app.get<RedisClientService>(RedisClientService).getClient();
        playerMemoryStorage = app.get<PlayerMemoryStorage>(PlayerMemoryStorage);
        normalIslandStorage = app.get<NormalIslandStorage>(NormalIslandStorage);
        desertedIslandStorage = app.get<DesertedIslandStorage>(
            DesertedIslandStorage,
        );
        gameIslandService = app.get<GameIslandService>(GameIslandService);
        normalIslandManager = app.get<NormalIslandManager>(NormalIslandManager);
        desertedIslandManager = app.get<DesertedIslandManager>(
            DesertedIslandManager,
        );
        islandActiveObjectReader = app.get<IslandActiveObjectReader>(
            IslandActiveObjectReader,
        );
        islandActiveObjectWriter = app.get<IslandActiveObjectWriter>(
            IslandActiveObjectWriter,
        );
        respawnQueueManager = app.get<RespawnQueueManager>(RespawnQueueManager);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.islandJoin.deleteMany();
        await db.playerSpawnPoint.deleteMany();
        await db.island.deleteMany();
        await db.map.deleteMany();
        await db.user.deleteMany();
    });

    describe('일반 섬 참여', () => {
        const user = generateUserEntityV2();
        const clientId = 'test-client-id';
        let map: Map;

        beforeEach(async () => {
            await db.user.create({ data: user });
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
            await db.playerSpawnPoint.create({
                data: {
                    id: v4(),
                    mapId: map.id,
                    x: 0,
                    y: 0,
                    createdAt: new Date(),
                },
            });
        });

        it('일반 섬 참여 정상 동작', async () => {
            const clientId = 'test-client-id';

            const island = generateNormalIslandModel({ mapKey: map.key });
            await normalIslandStorage.createIsland(island);

            // 섬에 오브젝트 생성
            const activeObject = generateActiveObject(island.id);
            islandActiveObjectWriter.createMany([activeObject]);

            const result = await gameIslandService.joinNormalIsland(
                user.id,
                clientId,
                island.id,
            );

            const joinedIsland = await normalIslandStorage.getIsland(
                result.joinedIsland.id,
            );

            expect(joinedIsland?.players.size).toEqual(1);
            expect(joinedIsland?.players.has(user.id)).toEqual(true);
            expect(result.activePlayers.length).toEqual(0);
            expect(result.joinedIsland.id).toEqual(island.id);
            expect(result.joinedPlayer.id).toEqual(user.id);
        });

        it('일반 섬 참여 시 섬의 activeObjects를 확인할 수 있다', async () => {
            const clientId = 'test-client-id';

            const island = generateNormalIslandModel({ mapKey: map.key });
            await normalIslandStorage.createIsland(island);

            // 섬에 여러 오브젝트 생성
            const activeObjects = [
                generateActiveObject(island.id, {
                    type: 'TREE',
                    x: 100,
                    y: 100,
                }),
                generateActiveObject(island.id, {
                    type: 'TREE_TALL',
                    x: 200,
                    y: 200,
                }),
            ];
            islandActiveObjectWriter.createMany(activeObjects);

            const result = await gameIslandService.joinNormalIsland(
                user.id,
                clientId,
                island.id,
            );

            // 섬의 activeObjects 확인
            const islandActiveObjects = islandActiveObjectReader.readAll(
                island.id,
            );

            expect(islandActiveObjects.length).toEqual(2);
            expect(islandActiveObjects[0].type).toEqual('TREE');
            expect(islandActiveObjects[0].x).toEqual(100);
            expect(islandActiveObjects[0].y).toEqual(100);
            expect(islandActiveObjects[1].type).toEqual('TREE_TALL');
            expect(islandActiveObjects[1].x).toEqual(200);
            expect(islandActiveObjects[1].y).toEqual(200);
            expect(result.joinedIsland.id).toEqual(island.id);
        });

        it('참여 인원이 가득찬 섬에 참여 시도 시 예외가 발생한다', async () => {
            const joinedPlayer = generatePlayerModel();

            const island = generateNormalIslandModel({
                max: 1,
                mapKey: map.key,
            });

            await normalIslandStorage.createIsland(island);
            await normalIslandStorage.addPlayerToIsland(
                island.id,
                joinedPlayer.id,
            );

            await expect(() =>
                gameIslandService.joinNormalIsland(
                    user.id,
                    clientId,
                    island.id,
                ),
            ).rejects.toThrow(
                new DomainException(
                    DomainExceptionType.ISLAND_FULL,
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    ISLAND_FULL,
                ),
            );
        });
    });

    describe('무인도 참여', () => {
        const user = generateUserEntityV2();
        const clientId = 'test-client-id';
        let map: Map;

        beforeEach(async () => {
            await db.user.create({ data: user });
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
            await db.playerSpawnPoint.create({
                data: {
                    id: v4(),
                    mapId: map.id,
                    x: 0,
                    y: 0,
                    createdAt: new Date(),
                },
            });
        });

        it('무인도 참여 정상 동작', async () => {
            const island = generateDesertedIslandModel({ mapKey: map.key });
            await desertedIslandStorage.createIsland(island);

            // 섬에 오브젝트 생성
            const activeObject = generateActiveObject(island.id);
            islandActiveObjectWriter.createMany([activeObject]);

            const result = await gameIslandService.joinDesertedIsland(
                user.id,
                clientId,
            );

            const joinedIsland = await desertedIslandStorage.getIsland(
                result.joinedIsland.id,
            );

            expect(joinedIsland?.players.size).toEqual(1);
            expect(joinedIsland?.players.has(user.id)).toEqual(true);
            expect(result.activePlayers.length).toEqual(0);
            expect(result.joinedIsland.id).toEqual(island.id);
            expect(result.joinedPlayer.id).toEqual(user.id);
        });

        it('무인도 참여 시 섬의 activeObjects를 확인할 수 있다', async () => {
            const island = generateDesertedIslandModel({ mapKey: map.key });
            await desertedIslandStorage.createIsland(island);

            // 섬에 여러 오브젝트 생성
            const activeObjects = [
                generateActiveObject(island.id, {
                    type: 'TREE',
                    x: 150,
                    y: 150,
                }),
                generateActiveObject(island.id, {
                    type: 'TREE_TALL',
                    x: 250,
                    y: 250,
                }),
            ];
            islandActiveObjectWriter.createMany(activeObjects);

            const result = await gameIslandService.joinDesertedIsland(
                user.id,
                clientId,
            );

            // 섬의 activeObjects 확인
            const islandActiveObjects = islandActiveObjectReader.readAll(
                island.id,
            );

            expect(islandActiveObjects.length).toEqual(2);
            expect(islandActiveObjects[0].type).toEqual('TREE');
            expect(islandActiveObjects[0].x).toEqual(150);
            expect(islandActiveObjects[0].y).toEqual(150);
            expect(islandActiveObjects[1].type).toEqual('TREE_TALL');
            expect(islandActiveObjects[1].x).toEqual(250);
            expect(islandActiveObjects[1].y).toEqual(250);
            expect(result.joinedIsland.id).toEqual(island.id);
        });

        it('빈 섬이 없다면 새로운 섬을 생성해서 참여한다', async () => {
            const clientId = 'test-client-id';

            const result = await gameIslandService.joinDesertedIsland(
                user.id,
                clientId,
            );

            const joinedIsland = await desertedIslandStorage.getIsland(
                result.joinedIsland.id,
            );

            expect(joinedIsland?.players.size).toEqual(1);
            expect(joinedIsland?.players.has(user.id)).toEqual(true);
            expect(result.activePlayers.length).toEqual(0);
            expect(result.joinedPlayer.id).toEqual(user.id);
        });
    });

    describe('일반 섬 이탈', () => {
        const user = generateUserEntityV2();
        const liveIsland = generateNormalIslandModel();
        const island = generateIsland({
            ...liveIsland,
            maxMembers: liveIsland.max,
            updatedAt: new Date(),
        });

        beforeEach(async () => {
            await db.user.create({ data: user });
            await db.island.create({ data: island });
            await normalIslandStorage.createIsland(liveIsland);
        });

        it('섬 이탈 정상 동작', async () => {
            // 플레이어 생성 및 섬 참여
            const me = generatePlayerModel({ roomId: liveIsland.id });
            const otherPlayer = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(me);
            playerMemoryStorage.addPlayer(otherPlayer);

            await normalIslandStorage.addPlayerToIsland(liveIsland.id, me.id);
            await normalIslandStorage.addPlayerToIsland(
                liveIsland.id,
                otherPlayer.id,
            );

            await gameIslandService.handleLeave(me);

            const leavedPlayer = playerMemoryStorage.getPlayer(me.id);
            const islandAfterLeave = await normalIslandStorage.getIsland(
                liveIsland.id,
            );

            expect(leavedPlayer).toBeNull();
            expect(islandAfterLeave?.players.size).toEqual(1);
            expect(islandAfterLeave?.players.has(me.id)).toEqual(false);
        });

        it('섬 이탈 시 참여 인원이 0명일 경우 모든 오브젝트를 제거하고 섬을 삭제한다', async () => {
            const activeObject = generateActiveObject(liveIsland.id);
            islandActiveObjectWriter.createMany([activeObject]);

            // 리스폰 큐에 오브젝트 추가
            const respawnQueueItem = {
                objectId: activeObject.id,
                islandId: liveIsland.id,
                respawnTime: Date.now() + 60000, // 1분 후 리스폰
            };
            respawnQueueManager.addMany([respawnQueueItem]);

            // 플레이어 생성 및 섬 참여
            const me = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(me);
            await normalIslandStorage.addPlayerToIsland(liveIsland.id, me.id);

            await gameIslandService.handleLeave(me);

            const leavedPlayer = playerMemoryStorage.getPlayer(me.id);
            const islandAfterLeave = await normalIslandStorage.getIsland(
                liveIsland.id,
            );
            const deletedActiveObject = islandActiveObjectReader.readAll(
                liveIsland.id,
            );
            const deletedRespawnQueueItems = respawnQueueManager.getByIslandId(
                liveIsland.id,
            );

            expect(leavedPlayer).toBeNull();
            expect(islandAfterLeave).toBeNull();
            expect(deletedActiveObject.length).toEqual(0);
            expect(deletedRespawnQueueItems.length).toEqual(0);
        });

        it('섬 이탈 중 예외가 발생하면 이전 동작이 롤백된다', async () => {
            jest.spyOn(
                normalIslandManager,
                'removeEmpty',
            ).mockImplementationOnce((_: string) => {
                throw new Error('롤백을 위한 의도적 예외');
            });

            const me = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(me);
            await normalIslandStorage.addPlayerToIsland(liveIsland.id, me.id);

            const rollbackedPlayer = playerMemoryStorage.getPlayer(me.id);
            const islandAfterLeave = await normalIslandStorage.getIsland(
                liveIsland.id,
            );

            await expect(() =>
                gameIslandService.handleLeave(me),
            ).rejects.toThrow(new Error('롤백을 위한 의도적 예외'));
            expect(rollbackedPlayer?.id).toEqual(me.id);
            expect(islandAfterLeave?.players.size).toEqual(1);
            expect(islandAfterLeave?.players.has(me.id)).toEqual(true);
        });
    });

    describe('무인도 이탈', () => {
        const user = generateUserEntityV2();
        const liveIsland = generateDesertedIslandModel();
        const island = generateIsland({
            ...liveIsland,
            maxMembers: liveIsland.max,
            updatedAt: new Date(),
        });

        beforeEach(async () => {
            await db.user.create({ data: user });
            await db.island.create({ data: island });
            await desertedIslandStorage.createIsland(liveIsland);
        });

        it('무인도 이탈 정상 동작', async () => {
            // 플레이어 생성 및 섬 참여
            const me = generatePlayerModel({
                roomId: liveIsland.id,
                islandType: IslandTypeEnum.DESERTED,
            });
            const otherPlayer = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(me);
            playerMemoryStorage.addPlayer(otherPlayer);

            await desertedIslandStorage.addPlayerToIsland(liveIsland.id, me.id);
            await desertedIslandStorage.addPlayerToIsland(
                liveIsland.id,
                otherPlayer.id,
            );

            await gameIslandService.handleLeave(me);

            const leavedPlayer = playerMemoryStorage.getPlayer(me.id);
            const islandAfterLeave = await desertedIslandStorage.getIsland(
                liveIsland.id,
            );

            expect(leavedPlayer).toBeNull();
            expect(islandAfterLeave?.players.size).toEqual(1);
            expect(islandAfterLeave?.players.has(me.id)).toEqual(false);
        });

        it('섬 이탈 시 참여 인원이 0명일 경우 섬을 삭제한다', async () => {
            // 섬에 오브젝트 생성
            const activeObject = generateActiveObject(liveIsland.id);
            islandActiveObjectWriter.createMany([activeObject]);

            // 리스폰 큐에 오브젝트 추가
            const respawnQueueItem = {
                objectId: activeObject.id,
                islandId: liveIsland.id,
                respawnTime: Date.now() + 60000, // 1분 후 리스폰
            };
            respawnQueueManager.addMany([respawnQueueItem]);

            // 플레이어 생성 및 섬 참여
            const me = generatePlayerModel({
                roomId: liveIsland.id,
                islandType: IslandTypeEnum.DESERTED,
            });

            playerMemoryStorage.addPlayer(me);
            await desertedIslandStorage.addPlayerToIsland(liveIsland.id, me.id);

            await gameIslandService.handleLeave(me);

            const leavedPlayer = playerMemoryStorage.getPlayer(me.id);
            const islandAfterLeave = await desertedIslandStorage.getIsland(
                liveIsland.id,
            );
            const deletedActiveObject = islandActiveObjectReader.readAll(
                liveIsland.id,
            );
            const deletedRespawnQueueItems = respawnQueueManager.getByIslandId(
                liveIsland.id,
            );

            expect(leavedPlayer).toBeNull();
            expect(islandAfterLeave).toBeNull();
            expect(deletedActiveObject.length).toEqual(0);
            expect(deletedRespawnQueueItems.length).toEqual(0);
        });

        it('섬 이탈 중 예외가 발생하면 이전 동작이 롤백된다', async () => {
            jest.spyOn(
                desertedIslandManager,
                'removeEmpty',
            ).mockImplementationOnce((_: string) => {
                throw new Error('롤백을 위한 의도적 예외');
            });

            const me = generatePlayerModel({
                roomId: liveIsland.id,
                islandType: IslandTypeEnum.DESERTED,
            });

            playerMemoryStorage.addPlayer(me);
            await desertedIslandStorage.addPlayerToIsland(liveIsland.id, me.id);

            const rollbackedPlayer = playerMemoryStorage.getPlayer(me.id);
            const islandAfterLeave = await desertedIslandStorage.getIsland(
                liveIsland.id,
            );

            await expect(() =>
                gameIslandService.handleLeave(me),
            ).rejects.toThrow(new Error('롤백을 위한 의도적 예외'));
            expect(rollbackedPlayer?.id).toEqual(me.id);
            expect(islandAfterLeave?.players.size).toEqual(1);
            expect(islandAfterLeave?.players.has(me.id)).toEqual(true);
        });
    });

    describe('일반 섬 입장 가능 여부 확인', () => {
        const user = generateUserEntityV2();
        const liveIsland = generateNormalIslandModel({ max: 1 });
        const island = generateIsland({
            ...liveIsland,
            maxMembers: liveIsland.max,
            updatedAt: new Date(),
        });

        beforeEach(async () => {
            await db.user.create({ data: user });
            await db.island.create({ data: island });
        });

        it('참여가 가능한 경우', async () => {
            await normalIslandStorage.createIsland(liveIsland);

            const canJoin = await gameIslandService.checkCanJoin(liveIsland.id);

            expect(canJoin.canJoin).toBe(true);
        });

        it('인원이 가득차서 참여가 불가능한 경우', async () => {
            await normalIslandStorage.createIsland(liveIsland);

            const joinedPlayer = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(joinedPlayer);
            await normalIslandStorage.addPlayerToIsland(
                liveIsland.id,
                joinedPlayer.id,
            );

            const canJoin = await gameIslandService.checkCanJoin(liveIsland.id);

            expect(canJoin.canJoin).toBe(false);
            expect(canJoin.reason).toBe(ISLAND_FULL);
        });

        it('존재하지 않는 섬이라서 참여가 불가능한 경우', async () => {
            const joinedPlayer = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(joinedPlayer);
            await normalIslandStorage.addPlayerToIsland(
                liveIsland.id,
                joinedPlayer.id,
            );

            const canJoin = await gameIslandService.checkCanJoin(liveIsland.id);

            expect(canJoin.canJoin).toBe(false);
            expect(canJoin.reason).toBe(ISLAND_NOT_FOUND_MESSAGE);
        });
    });

    describe('플레이어 추방', () => {
        const user = generateUserEntityV2();
        const liveIsland = generateNormalIslandModel({ max: 1 });
        const island = generateIsland({
            ...liveIsland,
            maxMembers: liveIsland.max,
            updatedAt: new Date(),
        });

        beforeEach(async () => {
            await db.user.create({ data: user });
            await db.island.create({ data: island });
        });

        it('플레이어 추방 정상 동작', async () => {
            const joinedPlayer = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(joinedPlayer);
            await normalIslandStorage.addPlayerToIsland(
                liveIsland.id,
                joinedPlayer.id,
            );

            await gameIslandService.kick(joinedPlayer.id);

            const kickedPlayer = playerMemoryStorage.getPlayer(joinedPlayer.id);

            expect(kickedPlayer).toBeNull();
        });

        it('섬에 존재하지 않는 플레이어일 경우 아무 동작도 수행되지 않는다', async () => {
            const noneExistPlayer = 'non-exist-player-id';

            const result = await gameIslandService.kick(noneExistPlayer);

            expect(result).toBeFalsy();
        });
    });
});

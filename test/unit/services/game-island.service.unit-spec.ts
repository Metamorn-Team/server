import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-config';
import { NormalIslandManager } from 'src/domain/components/islands/normal-storage/normal-island-manager';
import { ISLAND_FULL } from 'src/domain/exceptions/client-use-messag';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';
import { GameIslandServiceModule } from 'src/modules/game/game-island.service.module';
import {
    generateDesertedIslandModel,
    generateIsland,
    generateNormalIslandModel,
    generatePlayerModel,
    generateUserEntityV2,
} from 'test/helper/generators';

describe('GameIslandService', () => {
    let app: TestingModule;
    let db: PrismaService;
    let redis: Redis;
    let playerMemoryStorage: PlayerMemoryStorage;
    let normalIslandStorage: NormalIslandStorage;
    let desertedIslandStorage: DesertedIslandStorage;
    let gameIslandService: GameIslandService;

    let normalIslandManager: NormalIslandManager;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                GameIslandServiceModule,
                PrismaModule,
                ClsModule.forRoot(clsOptions),
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
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await redis.flushall();
        await db.islandJoin.deleteMany();
        await db.island.deleteMany();
        await db.user.deleteMany();
    });

    describe('일반 섬 참여', () => {
        const user = generateUserEntityV2();
        const clientId = 'test-client-id';

        beforeEach(async () => {
            await db.user.create({ data: user });
        });

        it('일반 섬 참여 정상 동작', async () => {
            const clientId = 'test-client-id';

            const island = generateNormalIslandModel();
            await normalIslandStorage.createIsland(island);

            const result = await gameIslandService.joinNormalIsland(
                user.id,
                clientId,
                island.id,
                0,
                0,
            );

            const joinedIsland = await normalIslandStorage.getIsland(
                result.joinedIslandId,
            );

            expect(joinedIsland?.players.size).toEqual(1);
            expect(joinedIsland?.players.has(user.id)).toEqual(true);
            expect(result.activePlayers.length).toEqual(0);
            expect(result.joinedIslandId).toEqual(island.id);
            expect(result.joinedPlayer.id).toEqual(user.id);
        });

        it('참여 인원이 가득찬 섬에 참여 시도 시 예외가 발생한다', async () => {
            const joinedPlayer = generatePlayerModel();

            const island = generateNormalIslandModel({ max: 1 });
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
                    0,
                    0,
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

        beforeEach(async () => {
            await db.user.create({ data: user });
        });

        it('무인도 참여 정상 동작', async () => {
            const island = generateDesertedIslandModel();
            await desertedIslandStorage.createIsland(island);

            const result = await gameIslandService.joinDesertedIsland(
                user.id,
                clientId,
                0,
                0,
            );

            const joinedIsland = await desertedIslandStorage.getIsland(
                result.joinedIslandId,
            );

            expect(joinedIsland?.players.size).toEqual(1);
            expect(joinedIsland?.players.has(user.id)).toEqual(true);
            expect(result.activePlayers.length).toEqual(0);
            expect(result.joinedIslandId).toEqual(island.id);
            expect(result.joinedPlayer.id).toEqual(user.id);
        });

        it('빈 섬이 없다면 새로운 섬을 생성해서 참여한다', async () => {
            const clientId = 'test-client-id';

            const result = await gameIslandService.joinDesertedIsland(
                user.id,
                clientId,
                0,
                0,
            );

            const joinedIsland = await desertedIslandStorage.getIsland(
                result.joinedIslandId,
            );

            expect(joinedIsland?.players.size).toEqual(1);
            expect(joinedIsland?.players.has(user.id)).toEqual(true);
            expect(result.activePlayers.length).toEqual(0);
            expect(result.joinedPlayer.id).toEqual(user.id);
        });
    });

    describe('섬 이탈', () => {
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

        it('섬 이탈 시 참여 인원이 0명일 경우 섬을 삭제한다', async () => {
            // 플레이어 생성 및 섬 참여
            const me = generatePlayerModel({ roomId: liveIsland.id });

            playerMemoryStorage.addPlayer(me);
            await normalIslandStorage.addPlayerToIsland(liveIsland.id, me.id);

            await gameIslandService.handleLeave(me);

            const leavedPlayer = playerMemoryStorage.getPlayer(me.id);
            const islandAfterLeave = await normalIslandStorage.getIsland(
                liveIsland.id,
            );

            expect(leavedPlayer).toBeNull();
            expect(islandAfterLeave).toBeNull();
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

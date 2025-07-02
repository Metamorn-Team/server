import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { ATTACK_BOX_SIZE } from 'src/constants/game/attack-box';
import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { MOVING_THRESHOLD } from 'src/constants/threshold';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { Player } from 'src/domain/models/game/player';
import { GameService } from 'src/domain/services/game/game.service';
import { LiveDesertedIsland } from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { RedisClientService } from 'src/infrastructure/redis/redis-client.service';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';
import { DesertedIslandStorageModule } from 'src/modules/game/desert-island-storage.module';
import { GameServiceModule } from 'src/modules/game/game-service.module';
import {
    generateDesertedIslandModel,
    generatePlayerModel,
    generateActiveObject,
} from 'test/helper/generators';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { ObjectStatus } from 'src/domain/types/spawn-object/active-object';
import { COMMON_IMPORTS } from 'test/unit/services/commom-imports';

describe('GameService', () => {
    let app: TestingModule;
    let redis: Redis;
    let gameService: GameService;
    let playerMemoryStorage: PlayerMemoryStorage;
    let desertedIslandStorage: DesertedIslandStorage;
    let islandActiveObjectReader: IslandActiveObjectReader;
    let islandActiveObjectWriter: IslandActiveObjectWriter;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [
                GameServiceModule,
                DesertedIslandStorageModule,
                ...COMMON_IMPORTS,
            ],
        }).compile();
        redis = app.get<RedisClientService>(RedisClientService).getClient();

        gameService = app.get<GameService>(GameService);
        playerMemoryStorage = app.get<PlayerMemoryStorage>(PlayerMemoryStorage);
        desertedIslandStorage = app.get<DesertedIslandStorage>(
            DesertedIslandStorage,
        );
        islandActiveObjectReader = app.get<IslandActiveObjectReader>(
            IslandActiveObjectReader,
        );
        islandActiveObjectWriter = app.get<IslandActiveObjectWriter>(
            IslandActiveObjectWriter,
        );
    });

    afterEach(async () => {
        await redis.flushdb();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('플레이어 이동', () => {
        const lastMoved = Date.now();
        let player: Player;
        const newX = 3;
        const newY = 3;

        beforeEach(() => {
            player = generatePlayerModel({ lastMoved });
            playerMemoryStorage.addPlayer(player);
        });

        it('플레이어 이동 정상 동작', async () => {
            const now = lastMoved + MOVING_THRESHOLD;

            await gameService.move(player.id, newX, newY, now);

            const movedPlayer = playerMemoryStorage.getPlayer(player.id);
            const { x, y } = movedPlayer!;

            expect(x).toEqual(newX);
            expect(y).toEqual(newY);
        });

        it('threshold만큼 시간이 지나지 않은 상태에서는 이동이 되지 않는다', async () => {
            const now = lastMoved + (MOVING_THRESHOLD - 1);
            const { x: initX, y: initY } = player;

            await gameService.move(player.id, newX, newY, now);

            const movedPlayer = playerMemoryStorage.getPlayer(player.id);
            const { x, y } = movedPlayer!;

            expect(x).toEqual(initX);
            expect(y).toEqual(initY);
        });

        it('존재하지 않는 플레이어인 경우 예외가 발생한다 ', async () => {
            const nonExistPlayerId = 'none';

            await expect(() =>
                gameService.move(nonExistPlayerId, newX, newY),
            ).rejects.toThrow(
                new DomainException(
                    DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                    HttpStatus.NOT_FOUND,
                    PLAYER_NOT_FOUND_IN_STORAGE,
                ),
            );
        });
    });

    describe('플레이어 공격', () => {
        let island: LiveDesertedIsland;
        let attacker: Player;

        beforeEach(async () => {
            island = generateDesertedIslandModel();
            attacker = generatePlayerModel({
                isFacingRight: true,
                roomId: island.id,
                islandType: IslandTypeEnum.DESERTED,
                x: 0,
                y: 0,
            });

            await desertedIslandStorage.createIsland(island);
            playerMemoryStorage.addPlayer(attacker);
            await desertedIslandStorage.addPlayerToIsland(
                island.id,
                attacker.id,
            );
        });

        it('공격 범위에 속하는 모든 플레이어는 공격 대상이 된다', async () => {
            // 공격 범위 내의 가장 좌측 좌표
            const attackedLeft = generatePlayerModel({
                roomId: island.id,
                islandType: IslandTypeEnum.DESERTED,
                x: PLAYER_HIT_BOX.PAWN.RADIUS + 1,
                y: 0,
            });
            // 공격 범위 내의 가장 우측 좌표
            const attackedRight = generatePlayerModel({
                roomId: island.id,
                islandType: IslandTypeEnum.DESERTED,
                x: PLAYER_HIT_BOX.PAWN.RADIUS + ATTACK_BOX_SIZE.PAWN.width - 1,
                y: 0,
            });

            playerMemoryStorage.addPlayer(attackedLeft);
            playerMemoryStorage.addPlayer(attackedRight);

            await desertedIslandStorage.addPlayerToIsland(
                island.id,
                attackedLeft.id,
            );
            await desertedIslandStorage.addPlayerToIsland(
                island.id,
                attackedRight.id,
            );

            const result = await gameService.attackPlayer(attacker.id);

            expect(result.attacker.id).toEqual(attacker.id);
            expect(result.attackedPlayers.length).toEqual(2);
            expect(
                result.attackedPlayers.map((player) => player.id).sort(),
            ).toEqual([attackedLeft.id, attackedRight.id].sort());
        });

        it('공격 범위 경계에 겹치는 플레이어는 공격을 받지 않는다', async () => {
            // 공격 범위 좌측 경계에 걸침
            const attackedPlayer1 = generatePlayerModel({
                roomId: island.id,
                islandType: IslandTypeEnum.DESERTED,
                x: -PLAYER_HIT_BOX.PAWN.RADIUS,
                y: 0,
            });
            // 공격 범위 우측 경계에 걸침
            const attackedPlayer2 = generatePlayerModel({
                roomId: island.id,
                islandType: IslandTypeEnum.DESERTED,
                x: PLAYER_HIT_BOX.PAWN.RADIUS + ATTACK_BOX_SIZE.PAWN.width,
                y: 0,
            });

            playerMemoryStorage.addPlayer(attackedPlayer1);
            playerMemoryStorage.addPlayer(attackedPlayer2);

            await desertedIslandStorage.addPlayerToIsland(
                island.id,
                attackedPlayer1.id,
            );
            await desertedIslandStorage.addPlayerToIsland(
                island.id,
                attackedPlayer2.id,
            );

            const result = await gameService.attackPlayer(attacker.id);

            expect(result.attacker.id).toEqual(attacker.id);
            expect(result.attackedPlayers.length).toEqual(0);
        });
    });

    describe('플레이어 하트비트', () => {
        let island: LiveDesertedIsland;
        let player: Player;

        beforeEach(async () => {
            island = generateDesertedIslandModel();
            player = generatePlayerModel({
                isFacingRight: true,
                roomId: island.id,
                islandType: IslandTypeEnum.DESERTED,
                x: 0,
                y: 0,
            });

            await desertedIslandStorage.createIsland(island);
            playerMemoryStorage.addPlayer(player);
            await desertedIslandStorage.addPlayerToIsland(island.id, player.id);
        });

        it('자신을 포함한 같은 섬에 있는 플레이어의 마지막 활동 시간을 조회한다', async () => {
            const now = Date.now();
            const otherPlayers = Array.from({ length: 3 }, (_, i) =>
                generatePlayerModel({
                    tag: `tag${i}`,
                    roomId: island.id,
                    lastActivity: now - i,
                }),
            );
            for (const player of otherPlayers) {
                playerMemoryStorage.addPlayer(player);
                await desertedIslandStorage.addPlayerToIsland(
                    island.id,
                    player.id,
                );
            }

            const heartbeats = await gameService.hearbeatFromIsland(player.id);

            expect(heartbeats).toEqual(
                expect.arrayContaining([
                    { id: player.id, lastActivity: player.lastActivity },
                    ...otherPlayers.map((p) => ({
                        id: p.id,
                        lastActivity: p.lastActivity,
                    })),
                ]),
            );
        });
    });

    describe('오브젝트 공격', () => {
        let island: LiveDesertedIsland;
        let attacker: Player;

        beforeEach(async () => {
            island = generateDesertedIslandModel();
            attacker = generatePlayerModel({
                isFacingRight: true,
                roomId: island.id,
                islandType: IslandTypeEnum.DESERTED,
                x: 0,
                y: 0,
            });

            await desertedIslandStorage.createIsland(island);
            playerMemoryStorage.addPlayer(attacker);
            await desertedIslandStorage.addPlayerToIsland(
                island.id,
                attacker.id,
            );
        });

        it('여러 플레이어가 동시 공격할 때 공격력 합산만큼 HP가 감소해야한다', async () => {
            const attackers = Array.from({ length: 100 }, (_, i) =>
                generatePlayerModel({
                    isFacingRight: true,
                    roomId: island.id,
                    islandType: IslandTypeEnum.DESERTED,
                    tag: `attacker${i}`,
                    minDamage: 2,
                    maxDamage: 2, // 각자 2 데미지
                    x: 0,
                    y: 0,
                }),
            );
            for (const attacker of attackers) {
                playerMemoryStorage.addPlayer(attacker);
                await desertedIslandStorage.addPlayerToIsland(
                    island.id,
                    attacker.id,
                );
            }

            const tree = generateActiveObject(island.id, {
                type: 'TREE',
                x: PLAYER_HIT_BOX.PAWN.RADIUS + 10,
                y: 0,
                hp: 500, // 충분한 HP
                maxHp: 500,
            });
            islandActiveObjectWriter.createMany([tree]);

            // 동시 공격 실행
            const attackPromises = attackers.map((attacker) =>
                gameService.attackObject(attacker.id),
            );

            await Promise.all(attackPromises);

            const finalObject = islandActiveObjectReader.readOne(
                island.id,
                tree.id,
            );

            // 레이스 컨디션이 없다면 정확히 500 - 200 = 300이어야 함
            expect(finalObject.hp).toBe(300);
            expect(finalObject.status).toBe(ObjectStatus.ALIVE);
        });

        it('1방이면 죽는 오브젝트를 여러 플레이어가 동시에 공격해도 한 플레이어의 공격만 적중한다', async () => {
            const attackers = Array.from({ length: 100 }, (_, i) =>
                generatePlayerModel({
                    isFacingRight: true,
                    roomId: island.id,
                    islandType: IslandTypeEnum.DESERTED,
                    tag: `attacker${i}`,
                    minDamage: 1,
                    maxDamage: 1,
                    x: 0,
                    y: 0,
                }),
            );
            for (const attacker of attackers) {
                playerMemoryStorage.addPlayer(attacker);
                await desertedIslandStorage.addPlayerToIsland(
                    island.id,
                    attacker.id,
                );
            }

            const tree = generateActiveObject(island.id, {
                type: 'TREE',
                x: PLAYER_HIT_BOX.PAWN.RADIUS + 10,
                y: 0,
                hp: 1, // 1방이면 죽음
                maxHp: 1,
            });
            islandActiveObjectWriter.createMany([tree]);

            // 동시 공격 실행
            const attackPromises = attackers.map((attacker) =>
                gameService.attackObject(attacker.id),
            );

            await Promise.all(attackPromises);

            const finalObject = islandActiveObjectReader.readOne(
                island.id,
                tree.id,
            );

            // 레이스 컨디션 방어가 제대로 작동해야 함
            // 한 명만 공격에 성공하고 나머지는 무효화되어야 함
            expect(finalObject.hp).toBe(0);
            expect(finalObject.status).toBe(ObjectStatus.DEAD);
        });

        it('공격 범위에 속하는 모든 오브젝트는 공격 대상이 된다', async () => {
            // 공격 범위 내의 오브젝트들 생성
            const attackedObjects = [
                generateActiveObject(island.id, {
                    type: 'TREE',
                    x: PLAYER_HIT_BOX.PAWN.RADIUS + 10,
                    y: 0,
                    hp: 100,
                    maxHp: 100,
                }),
                generateActiveObject(island.id, {
                    type: 'TREE_TALL',
                    x: PLAYER_HIT_BOX.PAWN.RADIUS + 20,
                    y: 0,
                    hp: 150,
                    maxHp: 150,
                }),
            ];

            islandActiveObjectWriter.createMany(attackedObjects);

            const result = await gameService.attackObject(attacker.id);

            expect(result.attacker.id).toEqual(attacker.id);
            expect(result.attackedObjects.length).toEqual(2);
            expect(result.attackedObjects.map((obj) => obj.id).sort()).toEqual(
                attackedObjects.map((obj) => obj.id).sort(),
            );

            // 공격받은 오브젝트들의 HP가 감소했는지 확인
            const updatedObjects = islandActiveObjectReader.readAll(island.id);
            updatedObjects.forEach((obj) => {
                const originalObject = attackedObjects.find(
                    (o) => o.id === obj.id,
                );
                if (originalObject) {
                    // 데미지가 0일 수 있으므로 HP가 감소했거나 같을 수 있음
                    expect(obj.hp).toBeLessThanOrEqual(originalObject.hp);
                }
            });
        });

        it('공격 범위 밖의 오브젝트는 공격을 받지 않는다', async () => {
            // 공격 범위 밖의 오브젝트 생성
            const outOfRangeObjects = [
                generateActiveObject(island.id, {
                    type: 'TREE',
                    x: -PLAYER_HIT_BOX.PAWN.RADIUS - 10,
                    y: 0,
                    hp: 100,
                    maxHp: 100,
                }),
                generateActiveObject(island.id, {
                    type: 'TREE_TALL',
                    x:
                        PLAYER_HIT_BOX.PAWN.RADIUS +
                        ATTACK_BOX_SIZE.PAWN.width +
                        10,
                    y: 0,
                    hp: 150,
                    maxHp: 150,
                }),
            ];

            islandActiveObjectWriter.createMany(outOfRangeObjects);

            const result = await gameService.attackObject(attacker.id);

            expect(result.attacker.id).toEqual(attacker.id);
            expect(result.attackedObjects.length).toEqual(0);

            // 오브젝트들의 HP가 변경되지 않았는지 확인
            const updatedObjects = islandActiveObjectReader.readAll(island.id);
            updatedObjects.forEach((obj) => {
                const originalObject = outOfRangeObjects.find(
                    (o) => o.id === obj.id,
                );
                if (originalObject) {
                    expect(obj.hp).toEqual(originalObject.hp);
                }
            });
        });

        it('HP가 0 이하가 된 오브젝트는 죽은 상태가 된다', async () => {
            // HP가 낮은 오브젝트 생성
            const weakObject = generateActiveObject(island.id, {
                type: 'TREE',
                x: PLAYER_HIT_BOX.PAWN.RADIUS + 5,
                y: 0,
                hp: 1,
                maxHp: 100,
            });

            islandActiveObjectWriter.createMany([weakObject]);

            const result = await gameService.attackObject(attacker.id);

            expect(result.attacker.id).toEqual(attacker.id);
            expect(result.attackedObjects.length).toEqual(1);

            // 오브젝트가 죽은 상태인지 확인
            const updatedObjects = islandActiveObjectReader.readAll(island.id);
            const deadObject = updatedObjects.find(
                (obj) => obj.id === weakObject.id,
            );
            expect(deadObject?.status).toEqual('DEAD');
            expect(deadObject?.hp).toBeLessThanOrEqual(0);
        });

        it('이미 죽은 오브젝트는 공격 대상이 되지 않는다', async () => {
            // 죽은 오브젝트 생성
            const deadObject = generateActiveObject(island.id, {
                type: 'TREE',
                x: PLAYER_HIT_BOX.PAWN.RADIUS + 5,
                y: 0,
                hp: 0,
                maxHp: 100,
            });
            deadObject.dead(); // 명시적으로 죽은 상태로 설정

            islandActiveObjectWriter.createMany([deadObject]);

            const result = await gameService.attackObject(attacker.id);

            expect(result.attacker.id).toEqual(attacker.id);
            expect(result.attackedObjects.length).toEqual(0);
        });
    });
});

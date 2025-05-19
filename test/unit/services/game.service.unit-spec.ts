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
} from 'test/helper/generators';

describe('GameService', () => {
    let app: TestingModule;
    let redis: Redis;
    let gameService: GameService;
    let playerMemoryStorage: PlayerMemoryStorage;
    let desertedIslandStorage: DesertedIslandStorage;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [GameServiceModule, DesertedIslandStorageModule],
        }).compile();
        redis = app.get<RedisClientService>(RedisClientService).getClient();

        gameService = app.get<GameService>(GameService);
        playerMemoryStorage = app.get<PlayerMemoryStorage>(PlayerMemoryStorage);
        desertedIslandStorage = app.get<DesertedIslandStorage>(
            DesertedIslandStorage,
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

            const result = await gameService.attack(attacker.id);

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

            const result = await gameService.attack(attacker.id);

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
            const sortedHeartbeats = heartbeats.sort(
                (a, b) => b.lastActivity - a.lastActivity,
            );
            const expected = [...otherPlayers, player].map((player) => ({
                id: player.id,
                lastActivity: player.lastActivity,
            }));

            expect(heartbeats.length).toEqual(otherPlayers.length + 1);
            expect(sortedHeartbeats).toEqual(expected);
        });
    });
});

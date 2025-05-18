import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MOVING_THRESHOLD } from 'src/constants/threshold';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { Player } from 'src/domain/models/game/player';
import { GameService } from 'src/domain/services/game/game.service';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';
import { GameServiceModule } from 'src/modules/game/game-service.module';
import { generatePlayerModel } from 'test/helper/generators';

describe('GameService', () => {
    let app: TestingModule;
    let gameService: GameService;
    let playerMemoryStorage: PlayerMemoryStorage;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [GameServiceModule],
        }).compile();

        gameService = app.get<GameService>(GameService);
        playerMemoryStorage = app.get<PlayerMemoryStorage>(PlayerMemoryStorage);
    });

    afterEach(async () => {});
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
});

import { Test, TestingModule } from '@nestjs/testing';
import { GameAttackManager } from 'src/domain/components/game/game-attack-manager';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';
import { GameComponentModule } from 'src/modules/game/game-component.module';
import { PlayerMemoryStorageModule } from 'src/modules/users/player-memory-storage.module';
import { generatePlayerModel } from 'test/helper/generators';

describe('GameAttackManager', () => {
    let app: TestingModule;
    let gameAttackManager: GameAttackManager;
    let playerMemoryStorage: PlayerMemoryStorage;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            imports: [GameComponentModule, PlayerMemoryStorageModule],
        }).compile();

        gameAttackManager = app.get<GameAttackManager>(GameAttackManager);
        playerMemoryStorage = app.get<PlayerMemoryStorage>(PlayerMemoryStorage);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('공격 범위 플레이어 찾기', () => {
        const attacker = generatePlayerModel({ x: 5, y: 5 });
        const attackedPlayer = generatePlayerModel({ x: 5, y: 5 });

        beforeEach(() => {
            playerMemoryStorage.addPlayer(attackedPlayer);
        });

        it('존재하지 않는 플레이어가 있는 경우 예외가 발생하지 않고 대상에서만 제외한다', () => {
            const nonExsistingPlayerId = 'non-existing-player-id';

            const playerIds = [attackedPlayer.id, nonExsistingPlayerId];

            const attackedPlayers = gameAttackManager.findTargetsInBox(
                playerIds,
                attacker.id,
                { x: 0, y: 0, width: 10, height: 10 },
            );

            expect(attackedPlayers.length).toEqual(1);
            expect(attackedPlayers[0].id).toEqual(attackedPlayer.id);
        });

        it('자신은 대상에서 제외된다', () => {
            const attackerId = attacker.id;

            const playerIds = [attackedPlayer.id, attackerId];

            const attackedPlayers = gameAttackManager.findTargetsInBox(
                playerIds,
                attackerId,
                { x: 0, y: 0, width: 10, height: 10 },
            );

            expect(attackedPlayers.length).toEqual(1);
            expect(attackedPlayers[0].id).toEqual(attackedPlayer.id);
        });
    });
});

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

        it('자신은 대상에서 제외된다', () => {
            const attackerId = attacker.id;

            const attackedPlayers = gameAttackManager.findCollidingObjects(
                attackerId,
                attacker.getAttackBox(),
                [{ id: attackedPlayer.id, hitBox: attackedPlayer.getHitBox() }],
            );

            expect(attackedPlayers.length).toEqual(1);
            expect(attackedPlayers[0].id).toEqual(attackedPlayer.id);
        });
    });
});

import { Module } from '@nestjs/common';
import { GameAttackManager } from 'src/domain/components/game/game-attack-manager';
import { GamePlayerManager } from 'src/domain/components/game/game-player-manager';
import { PlayerMemoryStorageComponentModule } from 'src/modules/users/player-memory-storage-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';

@Module({
    imports: [PlayerStorageComponentModule, PlayerMemoryStorageComponentModule],
    providers: [GamePlayerManager, GameAttackManager],
    exports: [GamePlayerManager, GameAttackManager],
})
export class GameComponentModule {}

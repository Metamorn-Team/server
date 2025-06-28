import { Module } from '@nestjs/common';
import { GameAttackManager } from 'src/domain/components/game/game-attack-manager';
import { GamePlayerManager } from 'src/domain/components/game/game-player-manager';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { PlayerMemoryStorageComponentModule } from 'src/modules/users/player-memory-storage-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';

@Module({
    imports: [
        PlayerStorageComponentModule,
        PlayerMemoryStorageComponentModule,
        IslandActiveObjectComponentModule,
    ],
    providers: [GamePlayerManager, GameAttackManager],
    exports: [GamePlayerManager, GameAttackManager],
})
export class GameComponentModule {}

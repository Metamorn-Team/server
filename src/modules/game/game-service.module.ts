import { Module } from '@nestjs/common';
import { GameService } from 'src/domain/services/game/game.service';
import { GameComponentModule } from 'src/modules/game/game-component.module';
import { IslandStorageReaderFactoryModule } from 'src/modules/islands/island-storage-reader-factory.module';
import { PlayerMemoryStorageComponentModule } from 'src/modules/users/player-memory-storage-component.module';

@Module({
    imports: [
        GameComponentModule,
        PlayerMemoryStorageComponentModule,
        IslandStorageReaderFactoryModule,
    ],
    providers: [GameService],
    exports: [GameService],
})
export class GameServiceModule {}

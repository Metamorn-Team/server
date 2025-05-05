import { Module } from '@nestjs/common';
import { PlayerStorage } from 'src/domain/interface/storages/game-storage';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Module({
    providers: [{ provide: PlayerStorage, useClass: PlayerMemoryStorage }],
    exports: [{ provide: PlayerStorage, useClass: PlayerMemoryStorage }],
})
export class GameStorageModule {}

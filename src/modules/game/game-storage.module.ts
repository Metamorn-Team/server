import { Module } from '@nestjs/common';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { MemoryStorage } from 'src/infrastructure/storages/memory-storage';

@Module({
    providers: [{ provide: GameStorage, useClass: MemoryStorage }],
    exports: [{ provide: GameStorage, useClass: MemoryStorage }],
})
export class GameStorageModule {}

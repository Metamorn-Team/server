import { Module } from '@nestjs/common';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Module({
    providers: [PlayerMemoryStorage],
    exports: [PlayerMemoryStorage],
})
export class PlayerMemoryStorageModule {}

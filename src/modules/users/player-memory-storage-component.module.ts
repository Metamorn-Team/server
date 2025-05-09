import { Module } from '@nestjs/common';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';
import { PlayerMemoryStorageModule } from 'src/modules/users/player-memory-storage.module';

@Module({
    imports: [PlayerMemoryStorageModule],
    providers: [PlayerMemoryStorageManager],
    exports: [PlayerMemoryStorageManager],
})
export class PlayerMemoryStorageComponentModule {}

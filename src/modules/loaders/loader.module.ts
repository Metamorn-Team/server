import { Module } from '@nestjs/common';
import { InitialPlayerLoader } from 'src/domain/loaders/InitialPlayerLoader';
import { PlayerStorageModule } from 'src/modules/game/player-storage.module';
import { PlayerMemoryStorageModule } from 'src/modules/users/player-memory-storage.module';

@Module({
    imports: [PlayerStorageModule, PlayerMemoryStorageModule],
    providers: [InitialPlayerLoader],
    exports: [InitialPlayerLoader],
})
export class LoaderModule {}

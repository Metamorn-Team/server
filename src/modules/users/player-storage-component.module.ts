import { Module } from '@nestjs/common';
import { PlayerStorageReader } from 'src/domain/components/users/player-storage-reader';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';
import { PlayerStorageModule } from 'src/modules/game/player-storage.module';

@Module({
    imports: [PlayerStorageModule],
    providers: [PlayerStorageReader, PlayerStorageWriter],
    exports: [PlayerStorageReader, PlayerStorageWriter],
})
export class PlayerStorageComponentModule {}

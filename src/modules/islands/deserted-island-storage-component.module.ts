import { Module } from '@nestjs/common';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { DesertedIslandStorageWriter } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-writer';
import { DesertedIslandStorageModule } from 'src/modules/game/desert-island-storage.module';

@Module({
    imports: [DesertedIslandStorageModule],
    providers: [DesertedIslandStorageReader, DesertedIslandStorageWriter],
    exports: [DesertedIslandStorageReader, DesertedIslandStorageWriter],
})
export class DesertedIslandStorageComponentModule {}

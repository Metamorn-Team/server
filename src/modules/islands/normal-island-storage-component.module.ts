import { Module } from '@nestjs/common';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { NormalIslandStorageWriter } from 'src/domain/components/islands/normal-storage/normal-island-storage-writer';
import { NormalIslandStorageModule } from 'src/modules/game/normal-island.storaga.module';

@Module({
    imports: [NormalIslandStorageModule],
    providers: [NormalIslandStorageReader, NormalIslandStorageWriter],
    exports: [NormalIslandStorageReader, NormalIslandStorageWriter],
})
export class NormalIslandStorageComponentModule {}

import { Module } from '@nestjs/common';
import { IslandStorageReaderFactory } from 'src/domain/components/islands/factory/island-storage-reader-factory';
import { DesertedIslandStorageComponentModule } from 'src/modules/islands/deserted-island-storage-component.module';
import { LivePrivateIslandComponentModule } from 'src/modules/islands/live-private-island-component.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';

@Module({
    imports: [
        NormalIslandStorageComponentModule,
        DesertedIslandStorageComponentModule,
        LivePrivateIslandComponentModule,
    ],
    providers: [IslandStorageReaderFactory],
    exports: [IslandStorageReaderFactory],
})
export class IslandStorageReaderFactoryModule {}

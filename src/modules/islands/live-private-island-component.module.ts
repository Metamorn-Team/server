import { Module } from '@nestjs/common';
import { LivePrivateIslandReader } from 'src/domain/components/islands/live-private-island-reader';
import { LivePrivateIslandWriter } from 'src/domain/components/islands/live-private-island-writer';
import { LivePrivateIslandStorageModule } from 'src/modules/islands/live-private-island-storage.module';

@Module({
    imports: [LivePrivateIslandStorageModule],
    providers: [LivePrivateIslandReader, LivePrivateIslandWriter],
    exports: [LivePrivateIslandReader, LivePrivateIslandWriter],
})
export class LivePrivateIslandComponentModule {}

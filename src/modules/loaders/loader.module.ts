import { Module } from '@nestjs/common';
import { IslandLoaderModule } from 'src/modules/loaders/island-loader.module';
import { PlayerLoaderModule } from 'src/modules/loaders/player-loader.module';

@Module({
    imports: [PlayerLoaderModule, IslandLoaderModule],
})
export class LoaderModule {}

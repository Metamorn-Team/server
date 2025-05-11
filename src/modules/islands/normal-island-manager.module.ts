import { Module } from '@nestjs/common';
import { NormalIslandManager } from 'src/domain/components/islands/normal-storage/normal-island-manager';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';

@Module({
    imports: [
        NormalIslandStorageComponentModule,
        PlayerStorageComponentModule,
        IslandJoinComponentModule,
        IslandComponentModule,
    ],
    providers: [NormalIslandManager],
    exports: [NormalIslandManager],
})
export class NormalIslandManagerModule {}

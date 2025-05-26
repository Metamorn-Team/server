import { Module } from '@nestjs/common';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';
import { IslandController } from 'src/presentation/controller/islands/island.controller';

@Module({
    imports: [NormalIslandStorageComponentModule, PlayerStorageComponentModule],
    controllers: [IslandController],
})
export class IslandModule {}

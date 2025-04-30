import { Module } from '@nestjs/common';
import { IslandService } from 'src/domain/services/islands/island.service';
import { DesertedIslandStorageModule } from 'src/modules/game/desert-island-storage.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { IslandController } from 'src/presentation/controller/island/island.controller';

@Module({
    imports: [IslandComponentModule, DesertedIslandStorageModule],
    controllers: [IslandController],
    providers: [IslandService],
    exports: [IslandService],
})
export class IslandModule {}

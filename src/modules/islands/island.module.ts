import { Module } from '@nestjs/common';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandStorageModule } from 'src/modules/game/island-storage.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { IslandController } from 'src/presentation/controller/island/island.controller';

@Module({
    imports: [IslandComponentModule, IslandStorageModule],
    controllers: [IslandController],
    providers: [IslandService],
    exports: [IslandService],
})
export class IslandModule {}

import { Module } from '@nestjs/common';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';

@Module({
    imports: [IslandComponentModule, NormalIslandStorageComponentModule],
    providers: [IslandService],
    exports: [IslandService],
})
export class IslandServiceModule {}

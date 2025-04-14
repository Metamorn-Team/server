import { Module } from '@nestjs/common';
import { IslandService } from 'src/domain/services/islands/island.service';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';

@Module({
    imports: [IslandComponentModule],
    providers: [IslandService],
    exports: [IslandService],
})
export class IslandModule {}

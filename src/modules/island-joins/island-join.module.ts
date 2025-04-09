import { Module } from '@nestjs/common';
import { IslandJoinService } from 'src/domain/services/island-join/island-join.service';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';

@Module({
    imports: [IslandJoinComponentModule],
    providers: [IslandJoinService],
    exports: [IslandJoinService],
})
export class IslandJoinModule {}

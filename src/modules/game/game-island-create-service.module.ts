import { Module } from '@nestjs/common';
import { GameIslandCreateService } from 'src/domain/services/game/game-island-create.service';
import { IslandTagComponentModule } from 'src/modules/island-tags/island-tag-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { TagComponentModule } from 'src/modules/tags/tag-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';

@Module({
    imports: [
        UserComponentModule,
        NormalIslandStorageComponentModule,
        IslandComponentModule,
        TagComponentModule,
        IslandTagComponentModule,
    ],
    providers: [GameIslandCreateService],
    exports: [GameIslandCreateService],
})
export class GameIslandCreateServiceModule {}

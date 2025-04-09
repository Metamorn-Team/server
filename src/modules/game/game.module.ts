import { Module } from '@nestjs/common';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { ZoneService } from 'src/domain/services/game/zone.service';
import { MemoryStorage } from 'src/infrastructure/storages/memory-storage';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';
import { GameZoneGateway } from 'src/presentation/gateway/game-zone.gateway';

@Module({
    imports: [UserComponentModule, IslandComponentModule],
    providers: [
        GameZoneGateway,
        ZoneService,
        { provide: GameStorage, useClass: MemoryStorage },
    ],
})
export class GameModule {}

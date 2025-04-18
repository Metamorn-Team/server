import { Module } from '@nestjs/common';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { ZoneService } from 'src/domain/services/game/zone.service';
import { MemoryStorage } from 'src/infrastructure/storages/memory-storage';
import { ChatMessageModule } from 'src/modules/chat-messages/chat-message.module';
import { GameStorageModule } from 'src/modules/game/game-storage.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';
import { GameZoneGateway } from 'src/presentation/gateway/game-zone.gateway';

@Module({
    imports: [
        GameStorageModule,
        UserComponentModule,
        IslandComponentModule,
        IslandJoinComponentModule,
        ChatMessageModule,
    ],
    providers: [GameZoneGateway, ZoneService],
})
export class GameModule {}

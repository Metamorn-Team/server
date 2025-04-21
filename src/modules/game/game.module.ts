import { Module } from '@nestjs/common';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { GameService } from 'src/domain/services/game/game.service';
import { MemoryStorage } from 'src/infrastructure/storages/memory-storage';
import { ChatMessageModule } from 'src/modules/chat-messages/chat-message.module';
import { GameStorageModule } from 'src/modules/game/game-storage.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';
import { IslandGateway } from 'src/presentation/gateway/island.gateway';

@Module({
    imports: [
        GameStorageModule,
        UserComponentModule,
        IslandComponentModule,
        IslandJoinComponentModule,
        ChatMessageModule,
    ],
    providers: [IslandGateway, GameService],
})
export class GameModule {}

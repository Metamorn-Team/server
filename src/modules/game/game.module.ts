import { Module } from '@nestjs/common';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { GameService } from 'src/domain/services/game/game.service';
import { ChatMessageModule } from 'src/modules/chat-messages/chat-message.module';
import { GameStorageModule } from 'src/modules/game/game-storage.module';
import { DesertedIslandStorageModule } from 'src/modules/game/desert-island-storage.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';
import { ChatGateway } from 'src/presentation/gateway/chat.gateway';
import { IslandGateway } from 'src/presentation/gateway/island.gateway';

@Module({
    imports: [
        GameStorageModule,
        DesertedIslandStorageModule,
        UserComponentModule,
        IslandComponentModule,
        IslandJoinComponentModule,
        ChatMessageModule,
    ],
    providers: [IslandGateway, ChatGateway, GameService, GameIslandService],
})
export class GameModule {}

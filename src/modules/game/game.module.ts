import { Module } from '@nestjs/common';
import { ChatMessageModule } from 'src/modules/chat-messages/chat-message.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { ChatGateway } from 'src/presentation/gateway/chat.gateway';
import { IslandGateway } from 'src/presentation/gateway/island.gateway';
import { LobyGateway } from 'src/presentation/gateway/loby.gateway';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { GameIslandCreateService } from 'src/domain/services/game/game-island-create.service';
import { TagComponentModule } from 'src/modules/tags/tag-component.module';
import { IslandTagComponentModule } from 'src/modules/island-tags/island-tag-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';
import { FriendGateway } from 'src/presentation/gateway/friend.gateway';
import { FriendsModule } from 'src/modules/friends/friends.module';
import { WsConnectionAuthenticator } from 'src/common/ws-auth/ws-connection-authenticator';
import { GameServiceModule } from 'src/modules/game/game-service.module';
import { GameIslandServiceModule } from 'src/modules/game/game-island.service.module';
import { GameIslandCreateServiceModule } from 'src/modules/game/game-island-create-service.module';

@Module({
    imports: [
        IslandComponentModule,
        ChatMessageModule,
        TagComponentModule,
        IslandTagComponentModule,
        FriendsModule,
        PlayerStorageComponentModule,
        NormalIslandStorageComponentModule,

        GameIslandCreateServiceModule,
        GameServiceModule,
        GameIslandServiceModule,
    ],
    providers: [
        LobyGateway,
        IslandGateway,
        ChatGateway,
        FriendGateway,
        WsConnectionAuthenticator,
    ],
})
export class GameModule {}

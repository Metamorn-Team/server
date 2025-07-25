import { Module } from '@nestjs/common';
import { ChatMessageModule } from 'src/modules/chat-messages/chat-message.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { ChatGateway } from 'src/presentation/gateway/chat.gateway';
import { IslandGateway } from 'src/presentation/gateway/island.gateway';
import { LobyGateway } from 'src/presentation/gateway/loby.gateway';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { TagComponentModule } from 'src/modules/tags/tag-component.module';
import { IslandTagComponentModule } from 'src/modules/island-tags/island-tag-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';
import { FriendGateway } from 'src/presentation/gateway/friend.gateway';
import { FriendsModule } from 'src/modules/friends/friends.module';
import { WsConnectionAuthenticator } from 'src/common/ws-auth/ws-connection-authenticator';
import { GameServiceModule } from 'src/modules/game/game-service.module';
import { GameIslandServiceModule } from 'src/modules/game/game-island.service.module';
import { GameIslandCreateServiceModule } from 'src/modules/game/game-island-create-service.module';
import { IslandSettingsGateway } from 'src/presentation/gateway/island-settings.gateway';
import { IslandServiceModule } from 'src/modules/islands/island-service.module';
import { IslandActiveObjectComponentModule } from 'src/modules/island-spawn-objects/island-active-object-component.module';
import { SocketClientComponentModule } from 'src/modules/socket-client/socket-client-componenet.module';

@Module({
    imports: [
        IslandComponentModule,
        ChatMessageModule,
        TagComponentModule,
        IslandTagComponentModule,
        FriendsModule,
        PlayerStorageComponentModule,
        NormalIslandStorageComponentModule,

        IslandServiceModule,
        GameIslandCreateServiceModule,
        GameServiceModule,
        GameIslandServiceModule,
        IslandActiveObjectComponentModule,

        SocketClientComponentModule,
    ],
    providers: [
        LobyGateway,
        IslandGateway,
        IslandSettingsGateway,
        ChatGateway,
        FriendGateway,
        WsConnectionAuthenticator,
    ],
})
export class GameModule {}

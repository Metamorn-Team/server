import { Module } from '@nestjs/common';
import { GameIslandService } from 'src/domain/services/game/game-island.service';
import { ChatMessageModule } from 'src/modules/chat-messages/chat-message.module';
import { IslandJoinComponentModule } from 'src/modules/island-joins/island-join-component.module';
import { IslandComponentModule } from 'src/modules/islands/island-component.module';
import { UserComponentModule } from 'src/modules/users/users-component.module';
import { ChatGateway } from 'src/presentation/gateway/chat.gateway';
import { IslandGateway } from 'src/presentation/gateway/island.gateway';
import { LobyGateway } from 'src/presentation/gateway/loby.gateway';
import { NormalIslandStorageComponentModule } from 'src/modules/islands/normal-island-storage-component.module';
import { DesertedIslandStorageComponentModule } from 'src/modules/islands/deserted-island-storage-component.module';
import { GameIslandCreateService } from 'src/domain/services/game/game-island-create.service';
import { TagComponentModule } from 'src/modules/tags/tag-component.module';
import { IslandTagComponentModule } from 'src/modules/island-tags/island-tag-component.module';
import { PlayerStorageComponentModule } from 'src/modules/users/player-storage-component.module';
import { PlayerMemoryStorageComponentModule } from 'src/modules/users/player-memory-storage-component.module';
import { IslandManagerFactoryModule } from 'src/modules/islands/island-manager-factory.module';
import { RedisTransactionManagerModule } from 'src/infrastructure/redis/redis-transaction-manger.module';
import { FriendGateway } from 'src/presentation/gateway/friend.gateway';
import { FriendsModule } from 'src/modules/friends/friends.module';
import { WsConnectionAuthenticator } from 'src/common/ws-auth/ws-connection-authenticator';
import { IslandStorageReaderFactoryModule } from 'src/modules/islands/island-storage-reader-factory.module';
import { GameServiceModule } from 'src/modules/game/game-service.module';

@Module({
    imports: [
        UserComponentModule,
        IslandComponentModule,
        IslandJoinComponentModule,
        ChatMessageModule,
        TagComponentModule,
        IslandTagComponentModule,
        FriendsModule,
        PlayerStorageComponentModule,
        PlayerMemoryStorageComponentModule,
        NormalIslandStorageComponentModule,
        DesertedIslandStorageComponentModule,
        IslandStorageReaderFactoryModule,
        IslandManagerFactoryModule,
        RedisTransactionManagerModule,

        GameServiceModule,
    ],
    providers: [
        LobyGateway,
        IslandGateway,
        ChatGateway,
        GameIslandService,
        GameIslandCreateService,
        FriendGateway,
        WsConnectionAuthenticator,
    ],
})
export class GameModule {}

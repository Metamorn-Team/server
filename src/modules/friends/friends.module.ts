import { Module } from '@nestjs/common';
import { FriendsComponentModule } from './friends-component.module';
import { FriendsController } from 'src/presentation/controller/friends/friends.controller';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import { UserComponentModule } from '../users/users-component.module';
import { PlayerMemoryStorageComponentModule } from 'src/modules/users/player-memory-storage-component.module';

@Module({
    imports: [
        FriendsComponentModule,
        UserComponentModule,
        PlayerMemoryStorageComponentModule,
    ],
    controllers: [FriendsController],
    providers: [FriendsService],
    exports: [FriendsService],
})
export class FriendsModule {}

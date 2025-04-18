import { Module } from '@nestjs/common';
import { FriendsComponentModule } from './friends-component.module';
import { FriendsController } from 'src/presentation/controller/friends/friends.controller';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import { UserComponentModule } from '../users/users-component.module';
import { GameStorageModule } from 'src/modules/game/game-storage.module';

@Module({
    imports: [FriendsComponentModule, UserComponentModule, GameStorageModule],
    controllers: [FriendsController],
    providers: [FriendsService],
})
export class FriendsModule {}

import { Module } from '@nestjs/common';
import { FriendsComponentModule } from './friends-component.module';
import { FriendsController } from 'src/presentation/controller/friends/friends.controller';
import { FriendsService } from 'src/domain/services/friends/friends.service';

@Module({
    imports: [FriendsComponentModule],
    controllers: [FriendsController],
    providers: [FriendsService],
})
export class FriendsModule {}

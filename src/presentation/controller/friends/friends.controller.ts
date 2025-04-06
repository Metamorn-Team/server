import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { FriendsService } from 'src/domain/services/friends/friends.service';

@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @Post('requests')
    async sendFriendRequest(
        @CurrentUser() userId: string,
        @Body() dto: SendFriendRequest,
    ): Promise<SendFriendResponse> {}
}

import { Injectable } from '@nestjs/common';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendChecker } from 'src/domain/components/friends/friend-checker';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { v4 } from 'uuid';

@Injectable()
export class FriendsService {
    constructor(
        private readonly friendWrite: FriendWriter,
        private readonly friendChecker: FriendChecker,
    ) {}

    async sendFriendRequest(
        userId: string,
        targetUserId: string,
    ): Promise<void> {
        await this.friendChecker.checkFriendship(userId, targetUserId);

        const prototype: FriendPrototype = {
            senderId: userId,
            receiverId: targetUserId,
        };
        const stdDate = new Date();
        const friend = FriendEntity.create(prototype, v4, stdDate);
        await this.friendWrite.create(friend);
    }
}

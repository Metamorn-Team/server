import { Injectable } from '@nestjs/common';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { v4 } from 'uuid';

@Injectable()
export class FriendsService {
    constructor(private readonly friendWrite: FriendWriter) {}

    async sendFriendRequest(
        userId: string,
        targetUserId: string,
    ): Promise<void> {
        const prototype: FriendPrototype = {
            senderId: userId,
            receiverId: targetUserId,
        };
        const stdDate = new Date();
        const friend = FriendEntity.create(prototype, v4, stdDate);
        await this.friendWrite.create(friend);
    }
}

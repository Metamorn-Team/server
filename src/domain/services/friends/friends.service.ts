import { Injectable } from '@nestjs/common';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendChecker } from 'src/domain/components/friends/friend-checker';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import {
    FriendPrototype,
    FriendRequestDirection,
} from 'src/domain/types/friend.types';
import { v4 } from 'uuid';
import { FriendReader } from 'src/domain/components/friends/friend-reader';
import { UserReader } from 'src/domain/components/users/user-reader';
import { GetFriendRequestsResponse } from 'src/presentation/dto/friends/response/get-friend-request-list.response';

@Injectable()
export class FriendsService {
    constructor(
        private readonly friendReader: FriendReader,
        private readonly friendWrite: FriendWriter,
        private readonly friendChecker: FriendChecker,
        private readonly userReader: UserReader,
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

    async getFriendRequestList(
        userId: string,
        direction: FriendRequestDirection,
        limit: number,
        cursor?: string,
    ): Promise<GetFriendRequestsResponse> {
        const { data: requestList, nextCursor } =
            await this.friendReader.readFriendsRequests(
                userId,
                direction,
                limit,
                cursor,
            );

        if (!requestList || requestList.length === 0) {
            return { data: [], nextCursor: null };
        }

        return { data: requestList, nextCursor };
    }
}

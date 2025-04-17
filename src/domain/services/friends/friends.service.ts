import { Injectable } from '@nestjs/common';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendChecker } from 'src/domain/components/friends/friend-checker';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import {
    FriendPrototype,
    FriendRequestDirection,
    FriendWithRelationInfo,
} from 'src/domain/types/friend.types';
import { v4 } from 'uuid';
import { FriendReader } from 'src/domain/components/friends/friend-reader';
import { GetFriendRequestsResponse } from 'src/presentation/dto/friends/response/get-friend-request-list.response';
import { GetFriendsResponse } from 'src/presentation/dto';

@Injectable()
export class FriendsService {
    constructor(
        private readonly friendReader: FriendReader,
        private readonly friendWriter: FriendWriter,
        private readonly friendChecker: FriendChecker,
    ) {}

    async getFriendsList(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<GetFriendsResponse> {
        const { data: friendData, nextCursor } =
            await this.friendReader.readFriendsList(userId, limit, cursor);

        const mappedResponseData = friendData.map(
            (friendRelation: FriendWithRelationInfo) => ({
                id: friendRelation.friend.id,
                nickname: friendRelation.friend.nickname,
                tag: friendRelation.friend.tag,
                avatarKey: friendRelation.friend.avatarKey,
                friendshipId: friendRelation.friendshipId,
                becameFriendAt: friendRelation.becameFriendAt,
            }),
        );

        return { data: mappedResponseData, nextCursor };
    }

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
        await this.friendWriter.create(friend);
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

    async acceptFriend(userId: string, requestId: string): Promise<void> {
        await this.friendReader.readRequestByIdAndStatus(
            userId,
            requestId,
            'PENDING',
        );

        await this.friendWriter.updateRequestStatus(requestId, 'ACCEPTED');
    }

    async rejectFriend(userId: string, requestId: string): Promise<void> {
        await this.friendReader.readRequestByIdAndStatus(
            userId,
            requestId,
            'PENDING',
        );

        await this.friendWriter.updateRequestStatus(requestId, 'REJECTED');
    }

    async removeFriendship(userId: string, friendshipId) {
        await this.friendChecker.checkUnfriend(userId, friendshipId);

        await this.friendWriter.deleteFriendship(friendshipId);
    }
}

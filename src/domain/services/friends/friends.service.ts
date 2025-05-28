import { HttpStatus, Injectable } from '@nestjs/common';
import { FriendWriter } from 'src/domain/components/friends/friend-writer';
import { FriendChecker } from 'src/domain/components/friends/friend-checker';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import {
    FriendPrototype,
    FriendRequestDirection,
    FriendRequestStatus,
} from 'src/domain/types/friend.types';
import { v4 } from 'uuid';
import { FriendReader } from 'src/domain/components/friends/friend-reader';
import { GetFriendRequestsResponse } from 'src/presentation/dto/friends/response/get-friend-request-list.response';
import { GetFriendsResponse } from 'src/presentation/dto';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';
import { FRIEND_REQUEST_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';

@Injectable()
export class FriendsService {
    constructor(
        private readonly playerMemoryStorageManager: PlayerMemoryStorageManager,
        private readonly friendReader: FriendReader,
        private readonly friendWriter: FriendWriter,
        private readonly friendChecker: FriendChecker,
    ) {}

    // TODO userId, friendId 식별 안 됨 수정 필요.
    async getFriendsList(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<GetFriendsResponse> {
        const { data: friendData, nextCursor } =
            await this.friendReader.readFriendsList(userId, limit, cursor);

        const mappedResponseData = friendData.map((friendRelation) => {
            let isOnline: boolean;

            try {
                isOnline = !!this.playerMemoryStorageManager.readOne(
                    friendRelation.friend.id,
                );
            } catch (e: unknown) {
                if (
                    e instanceof DomainException &&
                    e.errorType ===
                        DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE
                ) {
                    isOnline = false;
                } else {
                    throw e;
                }
            }

            return {
                id: friendRelation.friend.id,
                nickname: friendRelation.friend.nickname,
                tag: friendRelation.friend.tag,
                avatarKey: friendRelation.friend.avatarKey,
                friendshipId: friendRelation.friendshipId,
                becameFriendAt: friendRelation.becameFriendAt,
                isOnline,
            };
        });

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

    async acceptFriend(userId: string, targetId: string): Promise<void> {
        const friendship = await this.friendReader.readRequestBetweenUsers(
            userId,
            targetId,
        );

        if (friendship.status !== 'PENDING') {
            throw new DomainException(
                DomainExceptionType.FRIEND_REQUEST_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                FRIEND_REQUEST_NOT_FOUND_MESSAGE,
            );
        }

        await this.friendWriter.updateRequestStatus(friendship.id, 'ACCEPTED');
    }

    async rejectFriend(userId: string, targetId: string): Promise<void> {
        const friendship = await this.friendReader.readRequestBetweenUsers(
            userId,
            targetId,
        );

        if (
            friendship.status !== 'PENDING' ||
            friendship.receiverId !== userId
        ) {
            throw new DomainException(
                DomainExceptionType.FRIEND_REQUEST_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                FRIEND_REQUEST_NOT_FOUND_MESSAGE,
            );
        }

        await this.friendWriter.updateRequestStatus(friendship.id, 'REJECTED');
    }

    async removeFriendship(userId: string, friendshipId: string) {
        await this.friendChecker.checkUnfriend(userId, friendshipId);

        await this.friendWriter.deleteFriendship(friendshipId);
    }

    async getFriendshipStatus(
        userId: string,
        targeytUserId: string,
    ): Promise<FriendRequestStatus> {
        try {
            const friendship = await this.friendReader.readRequestBetweenUsers(
                userId,
                targeytUserId,
            );

            return friendship.status === 'ACCEPTED'
                ? 'ACCEPTED'
                : friendship.senderId === userId
                  ? 'SENT'
                  : 'RECEIVED';
        } catch (e) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.FRIEND_REQUEST_NOT_FOUND
            ) {
                return 'NONE';
            }

            throw e;
        }
    }

    async markAllRequestAsRead(userId: string) {
        await this.friendWriter.updateIsReadAll(userId);
    }

    async getFriendStatusesUsers(
        currentUserId: string,
        targetUserIds: string[],
    ): Promise<Map<string, FriendRequestStatus>> {
        const statues = new Map<string, FriendRequestStatus>();

        for (const targetId of targetUserIds) {
            statues.set(targetId, 'NONE');
        }

        const friendships = await this.friendReader.readFriendshipWithTargets(
            currentUserId,
            targetUserIds,
        );
        if (!friendships || friendships.length === 0) {
            return statues;
        }

        for (const friendship of friendships) {
            const targetId =
                friendship.senderId === currentUserId
                    ? friendship.receiverId
                    : friendship.senderId;

            if (friendship.status === 'ACCEPTED') {
                statues.set(targetId, 'ACCEPTED');
            }
            if (
                friendship.status === 'PENDING' &&
                targetId === friendship.senderId
            ) {
                statues.set(targetId, 'RECEIVED');
            }
            if (
                friendship.status === 'PENDING' &&
                targetId === friendship.receiverId
            ) {
                statues.set(targetId, 'SENT');
            }
        }

        return statues;
    }
}

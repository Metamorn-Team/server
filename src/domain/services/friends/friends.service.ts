import { Inject, Injectable } from '@nestjs/common';
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
import { PlayerStorage } from 'src/domain/interface/storages/game-storage';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';

@Injectable()
export class FriendsService {
    constructor(
        @Inject(PlayerStorage)
        private readonly gameStorage: PlayerStorage,
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
                isOnline = !!this.gameStorage.getPlayer(
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
}

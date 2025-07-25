import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { FRIEND_REQUEST_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import {
    FriendData,
    FriendRequestDirection,
    PaginatedFriends,
} from 'src/domain/types/friend.types';

@Injectable()
export class FriendReader {
    constructor(
        @Inject(FriendRepository)
        private readonly friendRepository: FriendRepository,
    ) {}

    async readFriendsList(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedFriends> {
        return await this.friendRepository.findFriendsByUserId(
            userId,
            limit,
            cursor,
        );
    }

    async readRequestBetweenUsers(firstUserId: string, secondUserId: string) {
        const friendRequest =
            await this.friendRepository.findRequestBetweenUsers(
                firstUserId,
                secondUserId,
            );

        if (!friendRequest) {
            throw new DomainException(
                DomainExceptionType.FRIEND_REQUEST_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                FRIEND_REQUEST_NOT_FOUND_MESSAGE,
            );
        }

        return friendRequest;
    }

    async readFriendsRequests(
        userId: string,
        direction: FriendRequestDirection,
        limit: number,
        cursor?: string,
    ) {
        return direction === 'received'
            ? await this.friendRepository.findReceivedRequestsByUserId(
                  userId,
                  limit,
                  cursor,
              )
            : await this.friendRepository.findSentRequestsByUserId(
                  userId,
                  limit,
                  cursor,
              );
    }

    async readFriendshipWithTargets(
        userId: string,
        targetIds: string[],
    ): Promise<FriendData[]> {
        return await this.friendRepository.findFriendshipsWithTargets(
            userId,
            targetIds,
        );
    }

    async getUnreadCount(userId: string) {
        return this.friendRepository.countUnread(userId);
    }
}

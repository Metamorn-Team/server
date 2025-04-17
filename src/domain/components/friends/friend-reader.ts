import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { FRIEND_REQUEST_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import {
    FriendRequestDirection,
    FriendStatus,
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

    async readRequestByIdAndStatus(
        userId: string,
        requestId: string,
        status: FriendStatus,
    ) {
        const request = await this.friendRepository.findOneByIdAndStatus(
            userId,
            requestId,
            status,
        );

        if (!request) {
            throw new DomainException(
                DomainExceptionType.FriendRequestNotFound,
                HttpStatus.NOT_FOUND,
                FRIEND_REQUEST_NOT_FOUND_MESSAGE,
            );
        }
    }

    async readRequestBetweenUsers(user1Id: string, user2Id: string) {
        const friendRequest =
            await this.friendRepository.findRequestBetweenUsers(
                user1Id,
                user2Id,
            );

        if (!friendRequest) {
            throw new DomainException(
                DomainExceptionType.FriendRequestNotFound,
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
}

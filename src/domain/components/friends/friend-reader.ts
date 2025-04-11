import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { FRIEND_REQUEST_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { FriendRepository } from 'src/domain/interface/friend.repository';

@Injectable()
export class FriendReader {
    constructor(
        @Inject(FriendRepository)
        private readonly friendRepository: FriendRepository,
    ) {}

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
}

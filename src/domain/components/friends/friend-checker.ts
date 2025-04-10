import { HttpStatus, Injectable } from '@nestjs/common';
import { FriendReader } from './friend-reader';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import {
    FRIEND_REQUEST_BAD_REQUEST_MESSAGE,
    FRIEND_REQUEST_CONFLICT_MESSAGE,
} from 'src/domain/exceptions/message';

@Injectable()
export class FriendChecker {
    constructor(private readonly friendReader: FriendReader) {}

    async checkFriendship(user1Id: string, user2Id: string): Promise<void> {
        try {
            if (user1Id === user2Id) {
                throw new DomainException(
                    DomainExceptionType.FriendRequestBadRequest,
                    HttpStatus.BAD_REQUEST,
                    FRIEND_REQUEST_BAD_REQUEST_MESSAGE,
                );
            }

            const existingRequeest =
                await this.friendReader.readRequestBetweenUsers(
                    user1Id,
                    user2Id,
                );

            if (existingRequeest) {
                throw new DomainException(
                    DomainExceptionType.FriendRequestConflict,
                    HttpStatus.CONFLICT,
                    FRIEND_REQUEST_CONFLICT_MESSAGE,
                );
            }

            return;
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.FriendRequestNotFound
            ) {
                return;
            }

            throw e;
        }
    }
}

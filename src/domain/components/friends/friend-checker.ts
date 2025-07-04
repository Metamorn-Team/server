import { HttpStatus, Injectable } from '@nestjs/common';
import { FriendReader } from './friend-reader';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import {
    FRIEND_REQUEST_BAD_REQUEST_MESSAGE,
    FRIEND_REQUEST_CONFLICT_MESSAGE,
} from 'src/domain/exceptions/message';
import { UserReader } from '../users/user-reader';

@Injectable()
export class FriendChecker {
    constructor(
        private readonly friendReader: FriendReader,
        private readonly userReader: UserReader,
    ) {}

    async checkFriendship(user1Id: string, user2Id: string): Promise<void> {
        try {
            if (user1Id === user2Id) {
                throw new DomainException(
                    DomainExceptionType.FRIEND_REQUEST_BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                    FRIEND_REQUEST_BAD_REQUEST_MESSAGE,
                );
            }

            await this.userReader.readProfile(user1Id);
            await this.userReader.readProfile(user2Id);

            const existingRequeest =
                await this.friendReader.readRequestBetweenUsers(
                    user1Id,
                    user2Id,
                );

            if (existingRequeest) {
                throw new DomainException(
                    DomainExceptionType.FRIEND_REQUEST_CONFLICT,
                    HttpStatus.CONFLICT,
                    FRIEND_REQUEST_CONFLICT_MESSAGE,
                );
            }

            return;
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.FRIEND_REQUEST_NOT_FOUND
            ) {
                return;
            }

            throw e;
        }
    }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { FriendReader } from 'src/domain/components/friends/friend-reader';
import { UserReader } from 'src/domain/components/users/user-reader';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import {
    GET_USER_BAD_REQUEST_MESSAGE,
    TAG_CONFLICT_MESSAGE,
} from 'src/domain/exceptions/message';
import { GetUserResponse } from 'src/presentation/dto';

@Injectable()
export class UserService {
    constructor(
        private readonly userReader: UserReader,
        private readonly userWriter: UserWriter,
        private readonly friendReader: FriendReader,
    ) {}

    async changeNickname(userId: string, nickname: string) {
        await this.userWriter.updateNickname(userId, nickname);
    }

    async changeTag(userId: string, tag: string) {
        try {
            const user = await this.userReader.readOneByTag(tag);

            if (user) {
                throw new DomainException(
                    DomainExceptionType.TagConflict,
                    HttpStatus.CONFLICT,
                    TAG_CONFLICT_MESSAGE,
                );
            }
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.UserNotFound
            ) {
                return await this.userWriter.updateTag(userId, tag);
            }
            throw e;
        }
    }

    async changeAvatar(userId: string, avatarKey: string) {
        await this.userWriter.updateAvatarKey(userId, avatarKey);
    }

    async getUserProfile(
        currentUserId: string,
        targetUserId: string,
    ): Promise<GetUserResponse> {
        const user = await this.userReader.readProfile(targetUserId);

        if (currentUserId === targetUserId) {
            throw new DomainException(
                DomainExceptionType.GetUserBadRequest,
                HttpStatus.BAD_REQUEST,
                GET_USER_BAD_REQUEST_MESSAGE,
            );
        }

        try {
            const request = await this.friendReader.readRequestBetweenUsers(
                currentUserId,
                targetUserId,
            );

            return request.status === 'ACCEPTED'
                ? { ...user, friendStatus: 'ACCEPTED' }
                : { ...user, friendStatus: 'PENDING' };
        } catch (_) {
            return {
                ...user,
                friendStatus: null,
            };
        }
    }
}

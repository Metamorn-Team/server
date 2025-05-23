import { HttpStatus, Injectable } from '@nestjs/common';
import { FriendReader } from 'src/domain/components/friends/friend-reader';
import { UserReader } from 'src/domain/components/users/user-reader';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { TAG_CONFLICT_MESSAGE } from 'src/domain/exceptions/message';

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
                    DomainExceptionType.TAG_CONFLICT,
                    HttpStatus.CONFLICT,
                    TAG_CONFLICT_MESSAGE,
                );
            }
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.USER_NOT_FOUND
            ) {
                return await this.userWriter.updateTag(userId, tag);
            }
            throw e;
        }
    }

    async changeAvatar(userId: string, avatarKey: string) {
        await this.userWriter.updateAvatarKey(userId, avatarKey);
    }

    async changeBio(userId: string, bio: string | null) {
        await this.userWriter.updateBio(userId, bio);
    }
}

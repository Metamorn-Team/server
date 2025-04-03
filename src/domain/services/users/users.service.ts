import { HttpStatus, Injectable } from '@nestjs/common';
import { UserReader } from 'src/domain/components/users/user-redear';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { TAG_CONFLICT_MESSAGE } from 'src/domain/exceptions/message';

@Injectable()
export class UserService {
    constructor(
        private readonly userReader: UserReader,
        private readonly userWriter: UserWriter,
    ) {}

    async updateNickname(userId: string, nickname: string) {
        await this.userWriter.change({ id: userId, nickname });
    }

    async updateTag(userId: string, tag: string) {
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
                return await this.userWriter.change({ id: userId, tag });
            }
            throw e;
        }
    }
}

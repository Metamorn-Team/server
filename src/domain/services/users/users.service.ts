import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import {
    TAG_CONFLICT_MESSAGE,
    USER_NOT_FOUND_MESSAGE,
} from 'src/domain/exceptions/message';
import { UserRepository } from 'src/domain/interface/user.repository';

@Injectable()
export class UserService {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) {}

    async getUser(userId: string) {
        const user = await this.userRepository.findOneById(userId);

        if (!user) {
            throw new DomainException(
                DomainExceptionType.UserNotFound,
                HttpStatus.NOT_FOUND,
                USER_NOT_FOUND_MESSAGE,
            );
        }

        return user;
    }

    async updateNickname(userId: string, nickname: string) {
        await this.userRepository.update({ id: userId, nickname });
    }

    async updateTag(userId: string, tag: string) {
        const userInfo = await this.userRepository.findOneByTag(tag);

        if (userInfo) {
            throw new DomainException(
                DomainExceptionType.TagConflict,
                HttpStatus.CONFLICT,
                TAG_CONFLICT_MESSAGE,
            );
        }

        await this.userRepository.update({ id: userId, tag });
    }
}

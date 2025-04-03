import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { USER_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { UserRepository } from 'src/domain/interface/user.repository';
import { PaginatedUsers } from 'src/domain/types/uesr.types';

@Injectable()
export class UserReader {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) {}

    async readProfile(userId: string) {
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

    async readOneByEmail(email: string) {
        const user = await this.userRepository.findOneByEmail(email);

        if (!user) {
            throw new DomainException(
                DomainExceptionType.UserNotFound,
                HttpStatus.NOT_FOUND,
                USER_NOT_FOUND_MESSAGE,
            );
        }

        return user;
    }

    async readOneByTag(tag: string) {
        const user = await this.userRepository.findOneByTag(tag);

        if (!user) {
            throw new DomainException(
                DomainExceptionType.UserNotFound,
                HttpStatus.NOT_FOUND,
                USER_NOT_FOUND_MESSAGE,
            );
        }

        return user;
    }

    async readManyByNickname(
        nickname: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedUsers> {
        return await this.userRepository.findManyByNickname(
            nickname,
            limit,
            cursor,
        );
    }

    async readManyByTag(tag: string, limit: number, cursor?: string) {
        return await this.userRepository.findManyByTag(tag, limit, cursor);
    }
}

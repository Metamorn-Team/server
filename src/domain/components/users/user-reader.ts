import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import {
    INVALID_INPUT_MESSAGE,
    USER_NOT_FOUND_MESSAGE,
} from 'src/domain/exceptions/message';
import { UserRepository } from 'src/domain/interface/user.repository';
import {
    PaginatedUsers,
    SearchVarient,
    UserInfo,
} from 'src/domain/types/uesr.types';

@Injectable()
export class UserReader {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) {}

    async readProfile(userId: string): Promise<UserInfo> {
        const user = await this.userRepository.findOneById(userId);

        if (!user) {
            throw new DomainException(
                DomainExceptionType.USER_NOT_FOUND,
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
                DomainExceptionType.USER_NOT_FOUND,
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
                DomainExceptionType.USER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                USER_NOT_FOUND_MESSAGE,
            );
        }

        return user;
    }

    async getGoldBalanceById(id: string) {
        const user = await this.userRepository.findUserGoldById(id);

        if (!user) {
            throw new DomainException(
                DomainExceptionType.USER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                USER_NOT_FOUND_MESSAGE,
            );
        }

        return user.gold;
    }

    async search(
        currentUserId: string,
        search: string,
        varient: SearchVarient,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedUsers> {
        if (!search || search.trim() === '') {
            return { data: [], nextCursor: null };
        }

        if (varient === 'NICKNAME') {
            return await this.userRepository.findStartWithNickname(
                currentUserId,
                search,
                limit,
                cursor,
            );
        }
        if (varient === 'TAG') {
            return await this.userRepository.findStartWithTag(
                currentUserId,
                search,
                limit,
                cursor,
            );
        }

        throw new DomainException(
            DomainExceptionType.INVALID_INPUT,
            HttpStatus.BAD_REQUEST,
            INVALID_INPUT_MESSAGE,
        );
    }
}

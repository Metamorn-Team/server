import { Inject, Injectable } from '@nestjs/common';
import {
    GetUserNotFoundException,
    TagConflictException,
} from 'src/domain/exceptions/exceptions';
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
            throw new GetUserNotFoundException({ id: userId });
        }

        return {
            email: user.email,
            nickname: user.nickname,
            tag: user.tag,
        };
    }

    async getMe(userId: string) {
        const user = await this.userRepository.findOneById(userId);

        if (!user) {
            throw new GetUserNotFoundException({ id: userId });
        }

        return user;
    }

    async updateNickname(userId: string, nickname: string) {
        await this.userRepository.update({ id: userId, nickname });
    }

    async updateTag(userId: string, tag: string) {
        const userInfo = await this.userRepository.findOneByTag(tag);

        if (userInfo) {
            throw new TagConflictException({ email: userInfo.email });
        }

        await this.userRepository.update({ id: userId, tag });
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { TagConflictException } from 'src/domain/exceptions/exceptions';
import { UserRepository } from 'src/domain/interface/user.repository';

@Injectable()
export class UserService {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) {}

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

import { Inject, Injectable } from '@nestjs/common';
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
        await this.userRepository.update({ id: userId, tag });
    }
}

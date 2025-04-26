import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UserRepository } from 'src/domain/interface/user.repository';

@Injectable()
export class UserWriter {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) {}

    async create(user: UserEntity) {
        await this.userRepository.save(user);
    }

    async updateNickname(id: string, nickname: string) {
        await this.userRepository.update(id, { nickname });
    }

    async updateTag(id: string, tag: string) {
        await this.userRepository.update(id, { tag });
    }

    async updateAvatarKey(id: string, avatarKey: string) {
        await this.userRepository.update(id, { avatarKey });
    }

    async updateGoldBalance(id: string, gold: number) {
        await this.userRepository.update(id, { gold });
    }
}

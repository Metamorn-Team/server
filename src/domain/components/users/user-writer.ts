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

    async change(user: { id: string; nickname?: string; tag?: string }) {
        await this.userRepository.update(user);
    }
}

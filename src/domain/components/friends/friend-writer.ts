import { Inject, Injectable } from '@nestjs/common';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendRepository } from 'src/domain/interface/friend.repository';

@Injectable()
export class FriendWriter {
    constructor(
        @Inject(FriendRepository)
        private readonly friendsRepository: FriendRepository,
    ) {}

    async create(friend: FriendEntity): Promise<void> {
        await this.friendsRepository.save(friend);
    }
}

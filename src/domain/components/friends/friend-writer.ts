import { Inject, Injectable } from '@nestjs/common';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { FriendReader } from './friend-reader';
import { FriendStatus } from 'src/domain/types/friend.types';

@Injectable()
export class FriendWriter {
    constructor(
        @Inject(FriendRepository)
        private readonly friendsRepository: FriendRepository,
        private readonly friendReader: FriendReader,
    ) {}

    async create(friend: FriendEntity): Promise<void> {
        await this.friendsRepository.save(friend);
    }

    async updateRequestStatus(
        requestId: string,
        status: FriendStatus,
    ): Promise<void> {
        await this.friendsRepository.updateStatus(requestId, status);
    }

    async deleteFriendship(friendshipId: string): Promise<void> {
        await this.friendsRepository.deleteById(friendshipId);
    }
}

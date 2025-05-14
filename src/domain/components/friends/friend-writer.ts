import { Inject, Injectable } from '@nestjs/common';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { FriendStatus } from 'src/domain/types/friend.types';

@Injectable()
export class FriendWriter {
    constructor(
        @Inject(FriendRepository)
        private readonly friendsRepository: FriendRepository,
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

    async updateIsReadAll(userId: string) {
        await this.friendsRepository.updateIsRead(userId);
    }

    async deleteFriendship(friendshipId: string): Promise<void> {
        await this.friendsRepository.deleteById(friendshipId);
    }
}

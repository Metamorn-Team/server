import { Inject, Injectable } from '@nestjs/common';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { FriendRepository } from 'src/domain/interface/friend.repository';
import { FriendReader } from './friend-reader';

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

    async changeRequestStatusToAccept(
        userId: string,
        requestId: string,
    ): Promise<void> {
        await this.friendReader.readPendingRequestById(userId, requestId);

        await this.friendsRepository.updateRequestStatusToAccept(requestId);
    }
}

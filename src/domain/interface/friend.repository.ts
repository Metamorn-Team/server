import { FriendEntity } from '../entities/friend/friend.entity';
import { FriendData } from '../types/friend.types';

export interface FriendRepository {
    save(data: FriendEntity): Promise<void>;
    findRequestBetweenUsers(
        senderId: string,
        receiverId: string,
    ): Promise<FriendData | null>;
}

export const FriendRepository = Symbol('FriendRepository');

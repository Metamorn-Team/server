import { FriendEntity } from '../entities/friend/friend.entity';

export interface FriendRepository {
    save(data: FriendEntity): Promise<void>;
}

export const FriendRepository = Symbol('FriendRepository');

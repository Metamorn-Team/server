import { FriendEntity } from '../entities/friend/friend.entity';
import { FriendData, PaginatedFriendRequests } from '../types/friend.types';

export interface FriendRepository {
    save(data: FriendEntity): Promise<void>;
    findRequestBetweenUsers(
        senderId: string,
        receiverId: string,
    ): Promise<FriendData | null>;
    findReceivedRequestsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedFriendRequests>;
    findSentRequestsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedFriendRequests>;
}

export const FriendRepository = Symbol('FriendRepository');

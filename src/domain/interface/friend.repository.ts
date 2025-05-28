import { FriendEntity } from '../entities/friend/friend.entity';
import {
    FriendData,
    FriendStatus,
    PaginatedFriendRequests,
    PaginatedFriends,
} from '../types/friend.types';

export interface FriendRepository {
    save(data: FriendEntity): Promise<void>;
    findFriendsByUserId(
        userId: string,
        limit: number,
        cursor?: string,
    ): Promise<PaginatedFriends>;
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
    updateStatus(friendshipId: string, status: FriendStatus): Promise<void>;
    updateIsRead(userId: string, isRead?: boolean): Promise<void>;
    findFriendshipsWithTargets(
        userId: string,
        targetIds: string[],
    ): Promise<FriendData[]>;
    deleteById(id: string): Promise<void>;
    countUnread(userId: string): Promise<number>;
}

export const FriendRepository = Symbol('FriendRepository');

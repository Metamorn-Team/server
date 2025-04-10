export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type FriendRequestDirection = 'sent' | 'received';

export interface FriendPrototype {
    readonly senderId: string;
    readonly receiverId: string;
}

export interface FriendData {
    readonly id: string;
    readonly senderId: string;
    readonly receiverId: string;
    readonly status: FriendStatus;
}
export interface ReceivedFriendRequestsData {
    readonly id: string;
    readonly senderId: string;
    readonly createdAt: Date;
}

export interface SentFriendRequestsData {
    readonly id: string;
    readonly receiverId: string;
    readonly createdAt: Date;
}

export interface ReceivedPaginatedFriendRequests {
    readonly data: ReceivedFriendRequestsData[];
    readonly nextCursor: string | null;
}

export interface SentPaginatedFriendRequests {
    readonly data: SentFriendRequestsData[];
    readonly nextCursor: string | null;
}

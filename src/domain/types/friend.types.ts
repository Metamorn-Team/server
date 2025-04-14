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

export interface FriendInfo {
    readonly id: string;
    readonly nickname: string;
    readonly tag: string;
    readonly avatarKey: string;
}

export interface FriendRequestsData {
    readonly id: string;
    readonly user: FriendInfo;
    readonly createdAt: Date;
}

export interface PaginatedFriendRequests {
    readonly data: FriendRequestsData[];
    readonly nextCursor: string | null;
}

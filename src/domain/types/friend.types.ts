export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

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

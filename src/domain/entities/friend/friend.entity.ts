import { FriendPrototype } from 'src/domain/types/friend.types';

enum FriendStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

export class FriendEntity {
    constructor(
        readonly id: string,
        readonly senderId: string,
        readonly receiverId: string,
        readonly status: FriendStatus,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    static create(
        input: FriendPrototype,
        idGen: () => string,
        stdDate: Date,
        updatedAt?: Date,
    ): FriendEntity {
        return new FriendEntity(
            idGen(),
            input.senderId,
            input.receiverId,
            FriendStatus.PENDING,
            stdDate,
            updatedAt ? updatedAt : stdDate,
        );
    }
}

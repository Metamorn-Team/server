import { FriendPrototype, FriendStatus } from 'src/domain/types/friend.types';

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
            'PENDING',
            stdDate,
            updatedAt ? updatedAt : stdDate,
        );
    }
}

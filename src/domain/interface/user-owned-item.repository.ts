import { UserOwnedItemEntity } from 'src/domain/entities/user-owned-items/user-owned-item.entity';

export interface UserOwnedItemRepository {
    save(data: UserOwnedItemEntity): Promise<void>;
    saveMany(data: UserOwnedItemEntity[]): Promise<void>;
}

export const UserOwnedItemRepository = Symbol('UserOwnedItemRepository');

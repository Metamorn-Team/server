import { UserOwnedItemEntity } from 'src/domain/entities/user-owned-items/user-owned-item.entity';
import { Item, ItemGradeEnum, ItemTypeEnum } from 'src/domain/types/item.types';

export interface UserOwnedItemRepository {
    findAllByTypeAndGrade(
        userId: string,
        itemType: ItemTypeEnum,
        grade: ItemGradeEnum,
    ): Promise<Item[]>;
    save(data: UserOwnedItemEntity): Promise<void>;
    saveMany(data: UserOwnedItemEntity[]): Promise<void>;
}

export const UserOwnedItemRepository = Symbol('UserOwnedItemRepository');

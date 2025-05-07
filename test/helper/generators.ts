import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { ItemEntity } from 'src/domain/entities/item/item.entity';
import { ProducEntity } from 'src/domain/entities/product/product.entity';
import { PurchaseEntity } from 'src/domain/entities/purchase/purchase.entity';
import { TagEntity } from 'src/domain/entities/tag/tag.entity';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { ItemGradeEnum } from 'src/domain/types/item.types';
import { PurchaseStatusEnum } from 'src/domain/types/purchase.types';
import { Provider } from 'src/shared/types';
import { v4 } from 'uuid';

export const generateUserEntity = (
    email: string,
    nickname: string,
    tag: string,
    provider: Provider = 'GOOGLE',
    avatarKey = 'pawn',
    stdDate: Date = new Date(),
    updatedAt?: Date,
): UserEntity =>
    UserEntity.create(
        { email, nickname, tag, provider, avatarKey },
        v4,
        stdDate,
        updatedAt ? updatedAt : undefined,
    );

export const generateUserEntityV2 = (partial?: Partial<UserEntity>) => {
    const stdDate = new Date();

    return new UserEntity(
        partial?.id || v4(),
        partial?.email || 'test@test.com',
        partial?.nickname || 'test',
        partial?.tag || 'test',
        partial?.provider || 'GOOGLE',
        partial?.avatarKey || 'pawn',
        partial?.createdAt || stdDate,
        partial?.updatedAt || stdDate,
        partial?.deletedAt || null,
        partial?.bio || '난 나다',
        partial?.gold,
    );
};

export const generateIsland = (
    partial?: Partial<IslandEntity>,
): IslandEntity => {
    const stdDate = new Date();

    return new IslandEntity(
        partial?.id || v4(),
        partial?.maxMembers || 5,
        partial?.type || IslandTypeEnum.DESERTED,
        partial?.createdAt || stdDate,
        partial?.updatedAt || stdDate,
        partial?.ownerId,
        partial?.tag || 'dev',
        partial?.name,
        partial?.description,
        partial?.coverImage,
        partial?.deletedAt,
    );
};

export const generateIslandJoin = (
    partial?: Partial<IslandJoinEntity>,
): IslandJoinEntity => {
    const stdDate = new Date();

    return new IslandJoinEntity(
        partial?.id || v4(),
        partial?.islandId || v4(),
        partial?.userId || v4(),
        partial?.joinedAt || stdDate,
        partial?.leftAt || null,
    );
};

/**
 * default status: 'PENDING'
 */
export const generateFriendship = (
    senderId: string,
    receiverId: string,
    partial?: Partial<Omit<FriendEntity, 'senderId' | 'receiverId'>>,
) => {
    const stdDate = new Date();

    return new FriendEntity(
        partial?.id || v4(),
        senderId,
        receiverId,
        partial?.status || 'PENDING',
        partial?.createdAt || stdDate,
        partial?.updatedAt || stdDate,
    );
};

export const generateProduct = (
    itemId: string,
    partial?: Partial<Omit<ProducEntity, 'categoryId'>>,
) => {
    return new ProducEntity(
        partial?.id || v4(),
        itemId,
        partial?.name || '멋진 오라',
        partial?.description || '멋진 오라 설명',
        partial?.price || 1000,
        partial?.coverImage || 'https://image.com',
        partial?.createdAt || new Date(),
        partial?.updatedAt || new Date(),
    );
};

export const generateItem = (partial?: Partial<ItemEntity>) => {
    return new ItemEntity(
        partial?.id || v4(),
        partial?.name || '오라',
        partial?.description || '멋진 오라',
        partial?.type || 'aura',
        partial?.key || 'aura-1',
        partial?.grade || ItemGradeEnum.NORMAL,
        partial?.createdAt || new Date(),
    );
};

export const generatePurchase = (
    userId: string,
    productId: string,
    partial?: Partial<Omit<PurchaseEntity, 'userId' | 'productId'>>,
) => {
    return new PurchaseEntity(
        partial?.id || v4(),
        userId,
        productId,
        partial?.goldAmount || 100,
        partial?.purchasedAt || new Date(),
        partial?.status || PurchaseStatusEnum.COMPLETE,
        partial?.refundedAt || null,
    );
};

export const generateTag = (name: string) => {
    return new TagEntity(v4(), name, new Date());
};

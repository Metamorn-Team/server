import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { PLAYER_STATS } from 'src/constants/game/stats';
import { EquipmentEntity } from 'src/domain/entities/equipments/equipment.entity';
import { FriendEntity } from 'src/domain/entities/friend/friend.entity';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { ItemEntity } from 'src/domain/entities/item/item.entity';
import { ProducEntity } from 'src/domain/entities/product/product.entity';
import { PromotionEntity } from 'src/domain/entities/promotion/promotion.entity';
import { PurchaseEntity } from 'src/domain/entities/purchase/purchase.entity';
import { TagEntity } from 'src/domain/entities/tag/tag.entity';
import { UserOwnedItemEntity } from 'src/domain/entities/user-owned-items/user-owned-item.entity';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { Player } from 'src/domain/models/game/player';
import { SlotTypeEnum } from 'src/domain/types/equipment.types';
import {
    LiveDesertedIsland,
    LiveNormalIsland,
} from 'src/domain/types/game.types';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { ItemGradeEnum, ItemTypeEnum } from 'src/domain/types/item.types';
import { ProductTypeEnum } from 'src/domain/types/product.types';
import { PromotionTypeEnum } from 'src/domain/types/promotion.types';
import { PurchaseStatusEnum } from 'src/domain/types/purchase.types';
import {
    ActiveObject,
    ActiveObjectPrototype,
    ObjectStatus,
    PersistentObject,
    PersistentObjectPrototype,
} from 'src/domain/types/spawn-object/active-object';
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
        partial?.type ?? IslandTypeEnum.DESERTED,
        partial?.createdAt || stdDate,
        partial?.updatedAt || stdDate,
        partial?.mapId || v4(),
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
        partial?.productType || ProductTypeEnum.AURA,
        partial?.createdAt || new Date(),
        partial?.updatedAt || new Date(),
    );
};

export const generateItem = (partial?: Partial<ItemEntity>) => {
    return new ItemEntity(
        partial?.id || v4(),
        partial?.name || '오라',
        partial?.description || '멋진 오라',
        partial?.itemType || ItemTypeEnum.AURA,
        partial?.key || 'aura-1',
        partial?.grade || ItemGradeEnum.NORMAL,
        partial?.image || 'https://image.com',
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

export const generatePlayerModel = (partial?: Partial<Player>) => {
    const now = Date.now();
    return new Player({
        id: partial?.id || v4(),
        clientId: partial?.clientId || v4(),
        roomId: partial?.roomId || 'island-id',
        islandType: partial?.islandType ?? IslandTypeEnum.NORMAL,
        nickname: partial?.nickname || 'nick',
        tag: partial?.tag || 'tag',
        avatarKey: partial?.avatarKey || 'purple_pawn',
        x: partial?.x ?? 0,
        y: partial?.y ?? 0,
        radius: partial?.radius || PLAYER_HIT_BOX.PAWN.RADIUS,
        isFacingRight: partial?.isFacingRight ?? true,
        lastMoved: partial?.lastMoved || now,
        lastActivity: partial?.lastActivity || now,
        minDamage: partial?.minDamage ?? PLAYER_STATS.PAWN.MIN_DAMAGE,
        maxDamage: partial?.maxDamage ?? PLAYER_STATS.PAWN.MAX_DAMAGE,
    });
};

export const generateDesertedIslandModel = (
    partial?: Partial<LiveDesertedIsland>,
): LiveDesertedIsland => {
    return {
        id: partial?.id || v4(),
        max: partial?.max || 4,
        players: partial?.players || new Set(),
        type: IslandTypeEnum.DESERTED,
        mapKey: partial?.mapKey || 'island',
    };
};

export const generateNormalIslandModel = (
    partial?: Partial<LiveNormalIsland>,
): LiveNormalIsland => {
    return {
        id: partial?.id || v4(),
        max: partial?.max ?? 4,
        players: partial?.players || new Set(),
        type: IslandTypeEnum.NORMAL,
        coverImage: partial?.coverImage || 'https://example.com/cover.jpg',
        createdAt: partial?.createdAt || new Date(),
        description: partial?.description || 'Island description',
        name: partial?.name || 'Island name',
        tags: partial?.tags || ['tag1', 'tag2'],
        ownerId: partial?.ownerId || v4(),
        mapKey: partial?.mapKey || 'island',
    };
};

export const generateOwnedItem = (
    userId: string,
    itemId: string,
    aquiredAt = new Date(),
): UserOwnedItemEntity => {
    return new UserOwnedItemEntity(v4(), userId, itemId, aquiredAt);
};

export const generateEquipment = (
    userId: string,
    itemId: string,
    slot: SlotTypeEnum,
): EquipmentEntity => {
    const stdDate = new Date();
    return new EquipmentEntity(userId, itemId, slot, stdDate, stdDate);
};

export const generatePromotion = (
    partial?: Partial<PromotionEntity>,
): PromotionEntity => {
    const stdDate = new Date();
    return new PromotionEntity(
        partial?.id || v4(),
        partial?.name || '오픈 기념',
        partial?.type || PromotionTypeEnum.LAUNCH,
        partial?.description || '오픈 기념 무료 이벤트',
        partial?.startedAt || stdDate,
        partial?.endedAt ||
            // 1달
            new Date(stdDate.getTime() + 1000 * 60 * 60 * 24 * 30),
    );
};

export const generatePersistentObject = (
    islandId: string,
    partial?: Partial<Omit<PersistentObjectPrototype, 'islandId'>>,
): PersistentObject => {
    return new PersistentObject({
        id: partial?.id || v4(),
        islandId,
        type: partial?.type || 'TREE',
        status: partial?.status || ObjectStatus.ALIVE,
        maxHp: partial?.maxHp || 100,
        respawnTime: partial?.respawnTime || 10000,
        x: partial?.x || 0,
        y: partial?.y || 0,
    });
};

export const generateActiveObject = (
    islandId: string,
    partial?: Partial<Omit<ActiveObjectPrototype, 'islandId'>>,
): ActiveObject => {
    return new ActiveObject({
        id: partial?.id || v4(),
        islandId,
        type: partial?.type || 'TREE',
        x: partial?.x || 0,
        y: partial?.y || 0,
        respawnTime: partial?.respawnTime || 10000,
        maxHp: partial?.maxHp || 100,
        hp: partial?.hp || 100,
        status: partial?.status || ObjectStatus.ALIVE,
    });
};

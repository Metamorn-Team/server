import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { UserEntity } from 'src/domain/entities/user/user.entity';
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

export const generateIsland = (
    partial?: Partial<IslandEntity>,
): IslandEntity => {
    const stdDate = new Date();

    return new IslandEntity(
        partial?.id ?? v4(),
        partial?.tag ?? 'dev',
        partial?.createdAt ?? stdDate,
        partial?.updatedAt ?? stdDate,
        partial?.deletedAt ?? null,
    );
};

export const generateIslandJoin = (
    partial?: Partial<IslandJoinEntity>,
): IslandJoinEntity => {
    const stdDate = new Date();

    return new IslandJoinEntity(
        partial?.id ?? v4(),
        partial?.islandId ?? v4(),
        partial?.userId ?? v4(),
        partial?.joinedAt ?? stdDate,
        partial?.leftAt ?? null,
    );
};

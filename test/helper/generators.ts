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

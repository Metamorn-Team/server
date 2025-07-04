import { UserPrototype } from 'src/domain/types/uesr.types';
import { Provider } from 'src/shared/types';

export class UserEntity {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly nickname: string,
        readonly tag: string,
        readonly provider: Provider,
        readonly avatarKey: string,
        readonly createdAt: Date,
        readonly updatedAt: Date,
        readonly deletedAt: Date | null = null,
        readonly bio?: string | null,
        readonly gold = 0,
    ) {}

    static create(
        input: UserPrototype,
        idGen: () => string,
        stdDate = new Date(),
        updatedAt?: Date,
    ): UserEntity {
        return new UserEntity(
            idGen(),
            input.email,
            input.nickname,
            input.tag,
            input.provider,
            input.avatarKey,
            stdDate,
            updatedAt ? updatedAt : stdDate,
            null,
            input.bio,
        );
    }
}

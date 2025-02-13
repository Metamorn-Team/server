import { UserInfo } from 'src/domain/types/uesr.types';
import { UserEntity } from 'src/domain/entities/user/user.entity';

export interface UserRepository {
    save(data: UserEntity): Promise<void>;
    findOneByEmail(emial: string): Promise<UserInfo | null>;
    update(data: Partial<UserEntity>): Promise<void>;
}

export const UserRepository = Symbol('UserRepository');

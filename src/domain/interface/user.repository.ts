import { UserInfo } from 'src/domain/types/uesr.types';

export interface UserRepository {
    findOneByEmail(emial: string): Promise<UserInfo | null>;
}

export const UserRepository = Symbol('UserRepository');

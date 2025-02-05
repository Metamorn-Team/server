import { UserInfo } from '../types/uesr.types';

export interface UserRepositoy {
    findOneByEmail(emial: string): Promise<UserInfo | null>;
}

export const UserRepository = Symbol('UserRepository');

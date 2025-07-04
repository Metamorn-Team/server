import {
    RefreshToken,
    RefreshTokenUpdateData,
} from 'src/domain/types/refresh-token.types';
import { RefreshTokenEntity } from '../entities/refresh-token/refresh-token.entity';

export interface RefreshTokenRepository {
    create(data: RefreshTokenEntity): Promise<void>;
    findByToken(token: string): Promise<RefreshToken | null>;
    update(id: string, data: RefreshTokenUpdateData): Promise<void>;
    expireByUserId(userId: string): Promise<void>;
    expireByUserIdAndSessionId(
        userId: string,
        sessionId: string,
    ): Promise<void>;
}

export const RefreshTokenRepository = Symbol('RefreshTokenRepository');

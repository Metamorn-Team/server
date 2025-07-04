import { Inject, Injectable } from '@nestjs/common';
import {
    RefreshTokenEntity,
    RefreshTokenPrototype,
} from 'src/domain/entities/refresh-token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/domain/interface/refresh-token.repository';
import { RefreshTokenUpdateData } from 'src/domain/types/refresh-token.types';
import { v4 } from 'uuid';

@Injectable()
export class RefreshTokenWriter {
    constructor(
        @Inject(RefreshTokenRepository)
        private readonly refreshTokenRepository: RefreshTokenRepository,
    ) {}

    async create(prototype: RefreshTokenPrototype) {
        const token = RefreshTokenEntity.create(prototype, v4);
        await this.refreshTokenRepository.create(token);
    }

    async update(id: string, data: RefreshTokenUpdateData) {
        await this.refreshTokenRepository.update(id, data);
    }

    async expire(id: string) {
        await this.refreshTokenRepository.update(id, {
            expiredAt: new Date(),
        });
    }

    async expireByUserId(userId: string) {
        await this.refreshTokenRepository.expireByUserId(userId);
    }

    async expireByUserIdAndSessionId(userId: string, sessionId: string) {
        await this.refreshTokenRepository.expireByUserIdAndSessionId(
            userId,
            sessionId,
        );
    }
}

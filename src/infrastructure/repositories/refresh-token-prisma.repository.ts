import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from 'src/domain/entities/refresh-token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/domain/interface/refresh-token.repository';
import {
    RefreshToken,
    RefreshTokenUpdateData,
} from 'src/domain/types/refresh-token.types';

@Injectable()
export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async create(data: RefreshTokenEntity): Promise<void> {
        await this.txHost.tx.refreshToken.create({ data });
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return await this.txHost.tx.refreshToken.findUnique({
            select: {
                id: true,
                token: true,
                userId: true,
                sessionId: true,
                model: true,
                os: true,
                ip: true,
                browser: true,
            },
            where: { token, expiredAt: null },
        });
    }

    async update(id: string, data: RefreshTokenUpdateData): Promise<void> {
        await this.txHost.tx.refreshToken.update({
            where: { id },
            data,
        });
    }

    async expireByUserId(userId: string): Promise<void> {
        await this.txHost.tx.refreshToken.updateMany({
            where: { userId, expiredAt: null },
            data: { expiredAt: new Date() },
        });
    }

    async expireByUserIdAndSessionId(
        userId: string,
        sessionId: string,
    ): Promise<void> {
        await this.txHost.tx.refreshToken.updateMany({
            where: { userId, sessionId, expiredAt: null },
            data: { expiredAt: new Date() },
        });
    }
}

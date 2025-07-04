import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UserPrototype } from 'src/domain/types/uesr.types';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import { Provider } from 'src/shared/types';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { OauthUserInfo } from 'src/infrastructure/auth/strategy/oauth.strategy';
import {
    INVALID_TOKEN_MESSAGE,
    PROVIDER_CONFLICT,
    USER_NOT_REGISTERED_MESSAGE,
} from 'src/domain/exceptions/message';
import { UserReader } from 'src/domain/components/users/user-reader';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { UserChecker } from 'src/domain/components/users/user-checker';
import { RefreshTokenWriter } from 'src/domain/components/refresh-token/refresh-token-writer';
import { UserAgent } from 'src/common/types';
import { RefreshTokenReader } from 'src/domain/components/refresh-token/refresh-token-reader';
import { RefreshToken } from 'src/domain/types/refresh-token.types';
import { generateRandomString } from 'test/unit/utils/random';

interface TokenPayload {
    sub: string;
    sessionId?: string;
    jti?: string;
}

@Injectable()
export class AuthService {
    private readonly accessTokenExpiration: string;
    private readonly refreshTokenExpiration: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly oauthContext: OauthContext,
        private readonly userReader: UserReader,
        private readonly userWriter: UserWriter,
        private readonly userChecker: UserChecker,
        private readonly refreshTokenWriter: RefreshTokenWriter,
        private readonly refreshTokenReader: RefreshTokenReader,
    ) {
        this.accessTokenExpiration = this.configService.get<string>(
            'ACCESS_TOKEN_TIME',
        ) as string;
        this.refreshTokenExpiration = this.configService.get<string>(
            'REFRESH_TOKEN_TIME',
        ) as string;
    }

    async login(provider: Provider, oauthToken: string, agent: UserAgent) {
        const userInfo = await this.oauthContext.getUserInfo(
            provider,
            oauthToken,
        );

        try {
            const user = await this.userReader.readOneByEmail(userInfo.email);

            if (!(user.provider === provider)) {
                throw new DomainException<OauthUserInfo>(
                    DomainExceptionType.PROVIDER_CONFLICT,
                    HttpStatus.CONFLICT,
                    PROVIDER_CONFLICT,
                    userInfo,
                );
            }

            const refreshToken = await this.generateRefreshToken(
                user.id,
                agent,
            );
            const accessToken = await this.generateToken(
                {
                    sub: user.id,
                },
                this.accessTokenExpiration,
            );

            return {
                id: user.id,
                accessToken,
                refreshToken,
                email: user.email,
                nickname: user.nickname,
                tag: user.tag,
                avatarKey: user.avatarKey,
            };
        } catch (e) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.USER_NOT_FOUND
            ) {
                throw new DomainException<OauthUserInfo>(
                    DomainExceptionType.USER_NOT_REGISTERED,
                    HttpStatus.NOT_FOUND,
                    USER_NOT_REGISTERED_MESSAGE,
                    userInfo,
                );
            }

            throw e;
        }
    }

    async logout(userId: string, sessionId: string) {
        await this.refreshTokenWriter.expireByUserIdAndSessionId(
            userId,
            sessionId,
        );
    }

    async register(prototype: UserPrototype, agent: UserAgent) {
        await this.userChecker.checkDuplicateEmail(prototype.email);
        await this.userChecker.checkDuplicateTag(prototype.tag);

        const user = UserEntity.create(prototype, v4);
        await this.userWriter.create(user);

        const refreshToken = await this.generateRefreshToken(user.id, agent);
        const accessToken = await this.generateToken(
            {
                sub: user.id,
            },
            this.accessTokenExpiration,
        );

        return {
            id: user.id,
            accessToken,
            refreshToken,
            email: user.email,
            nickname: user.nickname,
            tag: user.tag,
            avatarKey: user.avatarKey,
        };
    }

    async refreshToken(token: string, agent: UserAgent) {
        const { sessionId } = agent;

        // 1. DB에서 refresh token 존재 여부 확인
        const existingRefreshToken =
            await this.refreshTokenReader.readOneByToken(token);
        if (!existingRefreshToken) {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }

        // 2. JWT 토큰 검증 (서명 및 만료 확인)
        let payload: TokenPayload;
        try {
            payload = await this.jwtService.verifyAsync<TokenPayload>(token);
        } catch (e) {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }

        // 3. 세션 ID 검증
        if (payload.sessionId !== sessionId) {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }

        // 4. Agent 정보 검증 (토큰 탈취 방지)
        if (!this.isValidAgent(existingRefreshToken, agent)) {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }

        // 5. 새로운 토큰 생성
        return await this.refreshTokenTransaction(
            existingRefreshToken.userId,
            existingRefreshToken.id,
            agent,
        );
    }

    @Transactional()
    private async refreshTokenTransaction(
        userId: string,
        existingTokenId: string,
        agent: UserAgent,
    ) {
        const newRefreshToken = await this.generateRefreshToken(userId, agent);
        await this.refreshTokenWriter.expire(existingTokenId);

        const accessToken = await this.generateToken(
            {
                sub: userId,
            },
            this.accessTokenExpiration,
        );

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    private async generateRefreshToken(
        userId: string,
        agent: UserAgent,
        jti = generateRandomString(16),
    ) {
        const refreshToken = await this.generateToken(
            {
                sub: userId,
                sessionId: agent.sessionId,
                jti,
            },
            this.refreshTokenExpiration,
        );
        await this.refreshTokenWriter.create({
            token: refreshToken,
            userId,
            sessionId: agent.sessionId,
            browser: agent.browser || 'unknown',
            model: agent.model || 'unknown',
            os: agent.os || 'unknown',
            ip: agent.ip || 'unknown',
        });

        return refreshToken;
    }

    private async generateToken(payload: TokenPayload, expiredTime: string) {
        return await this.jwtService.signAsync(payload, {
            expiresIn: expiredTime,
        });
    }

    private isValidAgent(
        existingToken: RefreshToken,
        currentAgent: UserAgent,
    ): boolean {
        if (
            existingToken.browser !== (currentAgent.browser || 'unknown') ||
            existingToken.model !== (currentAgent.model || 'unknown') ||
            existingToken.os !== (currentAgent.os || 'unknown')
        ) {
            return false;
        }

        return true;
    }
}

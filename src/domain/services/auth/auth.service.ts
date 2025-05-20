import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UserPrototype } from 'src/domain/types/uesr.types';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import { Provider } from 'src/shared/types';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { OauthUserInfo } from 'src/infrastructure/auth/strategy/oauth.strategy';
import {
    PROVIDER_CONFLICT,
    USER_NOT_REGISTERED_MESSAGE,
} from 'src/domain/exceptions/message';
import { UserReader } from 'src/domain/components/users/user-reader';
import { UserWriter } from 'src/domain/components/users/user-writer';
import { UserChecker } from 'src/domain/components/users/user-checker';

@Injectable()
export class AuthService {
    private readonly accessTokenExpiration: string;
    private readonly refreshTokenExpiration: string;

    constructor(
        private readonly userReader: UserReader,
        private readonly userWriter: UserWriter,
        private readonly userChecker: UserChecker,
        private readonly oauthContext: OauthContext,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.accessTokenExpiration = this.configService.get<string>(
            'ACCESS_TOKEN_TIME',
        ) as string;
        this.refreshTokenExpiration = this.configService.get<string>(
            'REFRESH_TOKEN_TIME',
        ) as string;
    }

    async login(provider: Provider, token: string) {
        const userInfo = await this.oauthContext.getUserInfo(provider, token);

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

            return {
                id: user.id,
                accessToken: await this.generateToken(
                    user.id,
                    this.accessTokenExpiration,
                ),
                refreshToken: await this.generateToken(
                    user.id,
                    this.refreshTokenExpiration,
                ),
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

    async register(prototype: UserPrototype) {
        await this.userChecker.checkDuplicateEmail(
            prototype.email,
            prototype.provider,
        );

        const stdDate = new Date();
        const user = UserEntity.create(prototype, v4, stdDate);
        await this.userWriter.create(user);

        return {
            id: user.id,
            accessToken: await this.generateToken(
                user.id,
                this.accessTokenExpiration,
            ),
            refreshToken: await this.generateToken(
                user.id,
                this.refreshTokenExpiration,
            ),
            email: user.email,
            nickname: user.nickname,
            tag: user.tag,
            avatarKey: user.avatarKey,
        };
    }

    async refresToken(userId: string) {
        return {
            accessToken: await this.generateToken(
                userId,
                this.accessTokenExpiration,
            ),
            refreshToken: await this.generateToken(
                userId,
                this.refreshTokenExpiration,
            ),
        };
    }

    private async generateToken(userId: string, expiredTime: string) {
        const paylod = { sub: userId };
        return await this.jwtService.signAsync(paylod, {
            expiresIn: expiredTime,
        });
    }
}

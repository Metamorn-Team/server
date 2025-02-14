import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UserRepository } from 'src/domain/interface/user.repository';
import { UserPrototype } from 'src/domain/types/uesr.types';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import { Provider } from 'src/shared/types';

@Injectable()
export class AuthService {
    private readonly accessTokenExpiration: string;
    private readonly refreshTokenExpiration: string;

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
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
        const user = await this.userRepository.findOneByEmail(userInfo.email);

        if (!user) {
            throw new NotFoundException(userInfo);
        }
        if (!(user.provider === provider)) {
            throw new ConflictException(userInfo);
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
        };
    }

    async register(prototype: UserPrototype) {
        const userByEmail = await this.userRepository.findOneByEmail(
            prototype.email,
        );

        if (userByEmail && userByEmail.provider === prototype.provider) {
            throw new ConflictException('이미 가입한 회원입니다.');
        }

        const stdDate = new Date();
        const user = UserEntity.create(prototype, v4, stdDate);
        await this.userRepository.save(user);

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
        };
    }

    private async generateToken(userId: string, expiredTime: string) {
        const paylod = { sub: userId };
        return await this.jwtService.signAsync(paylod, {
            expiresIn: expiredTime,
        });
    }
}

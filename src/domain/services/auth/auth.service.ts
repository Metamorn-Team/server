import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/domain/interface/user.repository';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import { Provider } from 'src/shared/types';

@Injectable()
export class AuthService {
    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        private readonly oauthContext: OauthContext,
        private readonly jwtService: JwtService,
    ) {}

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
            accessToken: await this.generateToken(user.id),
            accountId: user.accountId,
        };
    }

    async generateToken(paylod: string) {
        return await this.jwtService.signAsync(paylod);
    }
}

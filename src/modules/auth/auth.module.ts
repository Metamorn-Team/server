import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/presentation/controller/auth/auth.controller';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import { GoogleStrategy } from 'src/infrastructure/auth/strategy/google.strategy';
import { KakaoStrategy } from 'src/infrastructure/auth/strategy/kakao.strategy';
import { UserComponentModule } from '../users/users-component.module';
import { RefreshTokenComponentModule } from 'src/modules/refresh-token/refresh-token-component.module';
import { TurnAuthService } from 'src/domain/services/auth/turn-auth.service';

@Module({
    imports: [
        JwtModule.registerAsync({
            global: true,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>('JWT_SECRET_KEY'),
                };
            },
        }),
        UserComponentModule,
        RefreshTokenComponentModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        OauthContext,
        GoogleStrategy,
        KakaoStrategy,
        TurnAuthService,
    ],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import { GoogleStrategy } from 'src/infrastructure/auth/strategy/google.strategy';
import { AuthController } from 'src/presentation/auth/auth.controller';

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
        UserModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, OauthContext, GoogleStrategy],
})
export class AuthModule {}

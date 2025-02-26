import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/presentation/controller/auth/auth.controller';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { UserModule } from 'src/modules/users/users.module';
import { OauthContext } from 'src/infrastructure/auth/context/auth-context';
import { GoogleStrategy } from 'src/infrastructure/auth/strategy/google.strategy';

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

import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { Provider } from 'src/shared/types';
import { LoginRequest } from 'src/presentation/dto/auth/request/login.request';
import { LoginResponse } from 'src/presentation/dto/auth/response/login.response';
import { RegisterRequest } from 'src/presentation/dto/auth/request/register.request';
import { RegisterResponse } from 'src/presentation/dto/auth/response/register.response';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenGuard } from 'src/common/guard/refresh-token.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { RefreshTokenResponse } from 'src/presentation/dto/auth/response/refresh-token.response';

@Controller('auth')
export class AuthController {
    private readonly refreshCookieTime: number;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        this.refreshCookieTime = this.configService.get<number>(
            'REFRESH_COOKIE_TIME',
        ) as number;
    }

    @Post(':provider/login')
    async login(
        @Param('provider') provider: Provider,
        @Body() dto: LoginRequest,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponse> {
        const { accessToken } = dto;

        const loginResponse = await this.authService.login(
            provider,
            accessToken,
        );

        const { refreshToken, ...responseWithoutRefresh } = loginResponse;

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: this.refreshCookieTime,
        });

        return responseWithoutRefresh;
    }

    @Post('register')
    async register(
        @Body() dto: RegisterRequest,
        @Res({ passthrough: true }) response: Response,
    ): Promise<RegisterResponse> {
        const registerResponse = await this.authService.register(dto);

        const { refreshToken, ...responseWithoutRefresh } = registerResponse;

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: this.refreshCookieTime,
        });

        return responseWithoutRefresh;
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    async refreshToken(
        @CurrentUser() userId: string,
    ): Promise<RefreshTokenResponse> {
        return await this.authService.refresToken(userId);
    }
}

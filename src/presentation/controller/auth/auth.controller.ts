import {
    Body,
    Controller,
    Delete,
    HttpCode,
    Param,
    Post,
    Res,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { Provider } from 'src/shared/types';
import { LoginRequest } from 'src/presentation/dto/auth/request/login.request';
import { LoginResponse } from 'src/presentation/dto/auth/response/login.response';
import { RegisterRequest } from 'src/presentation/dto/auth/request/register.request';
import { RegisterResponse } from 'src/presentation/dto/auth/response/register.response';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenResponse } from 'src/presentation/dto/auth/response/refresh-token.response';
import {
    ApiBody,
    ApiCookieAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { cookieOptions } from 'src/configs/cookie-options';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { CurrentUserAgent } from 'src/common/decorator/user-agent.decorator';
import { UserAgent } from 'src/common/types';
import { CurrentRefreshToken } from 'src/common/decorator/refresh-token.decorator';
import { SessionId } from 'src/common/decorator/session-id.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';

@ApiTags('auth')
@UseFilters(HttpExceptionFilter)
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

    @ApiOperation({
        summary: '소셜 로그인',
        description:
            '지정된 Provider(GOOGLE, KAKAO, NAVER)와 Acess Token을 사용하여 로그인합니다. 성공 시 Access Token과 Refresh Token(Cookie)을 발급합니다.',
    })
    @ApiParam({
        name: 'provider',
        enum: ['GOOGLE', 'KAKAO', 'NAVER'],
        description: '소셜 로그인 제공자',
    })
    @ApiBody({ type: LoginRequest })
    @ApiResponse({
        status: 201,
        description: '로그인 성공',
        type: LoginResponse,
    }) // 성공 응답 설명
    @ApiResponse({ status: 404, description: '가입되지 않은 회원' })
    @ApiResponse({
        status: 409,
        description: '다른 플랫폼으로 가입한 이력 존재',
    })
    @Post(':provider/login')
    async login(
        @Param('provider') provider: Provider,
        @Body() dto: LoginRequest,
        @Res({ passthrough: true }) response: Response,
        @CurrentUserAgent() agent: UserAgent,
    ): Promise<LoginResponse> {
        const { accessToken } = dto;

        const loginResponse = await this.authService.login(
            provider,
            accessToken,
            agent,
        );

        const { refreshToken, ...responseWithoutRefresh } = loginResponse;

        response.cookie('refresh_token', refreshToken, cookieOptions());
        return responseWithoutRefresh;
    }

    @ApiOperation({
        summary: '회원가입',
        description:
            '새로운 사용자를 시스템에 등록합니다. 성공 시 Access Token과 Refresh Token(Cookie)을 발급합니다.',
    })
    @ApiBody({ type: RegisterRequest })
    @ApiResponse({
        status: 201,
        description: '회원가입 성공',
        type: RegisterResponse,
    })
    @ApiResponse({ status: 409, description: '이미 존재하는 이메일 또는 태그' })
    @Post('register')
    async register(
        @Body() dto: RegisterRequest,
        @Res({ passthrough: true }) response: Response,
        @CurrentUserAgent() agent: UserAgent,
    ): Promise<RegisterResponse> {
        const registerResponse = await this.authService.register(dto, agent);

        const { refreshToken, ...responseWithoutRefresh } = registerResponse;

        response.cookie('refresh_token', refreshToken, cookieOptions());

        return responseWithoutRefresh;
    }

    @ApiOperation({
        summary: 'Access Token 갱신',
        description:
            '유효한 Refresh Token(Cookie)을 사용하여 새로운 Access Token을 발급받습니다.',
    })
    @ApiCookieAuth('refresh_token')
    @ApiResponse({
        status: 200,
        description: '토큰 갱신 성공',
        type: RefreshTokenResponse,
    })
    @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token' })
    @HttpCode(200)
    @Post('token')
    async refreshToken(
        @Res({ passthrough: true }) response: Response,
        @CurrentUserAgent() agent: UserAgent,
        @CurrentRefreshToken() token: string,
    ): Promise<RefreshTokenResponse> {
        const { accessToken, refreshToken } =
            await this.authService.refreshToken(token, agent);

        response.cookie('refresh_token', refreshToken, cookieOptions());

        return { accessToken };
    }

    @ApiOperation({
        summary: '로그아웃',
        description: 'Refresh Token 삭제.',
    })
    @ApiResponse({
        status: 204,
        description: '로그인 성공',
    })
    @ApiResponse({ status: 404, description: '가입되지 않은 회원' })
    @ApiResponse({
        status: 409,
        description: '다른 플랫폼으로 가입한 이력 존재',
    })
    @HttpCode(204)
    @UseGuards(AuthGuard)
    @Delete('logout')
    async logout(
        @Res({ passthrough: true }) response: Response,
        @CurrentUser('userId') userId: string,
        @SessionId() sessionId: string,
    ): Promise<void> {
        await this.authService.logout(userId, sessionId);

        response.clearCookie('refresh_token', cookieOptions());
    }
}

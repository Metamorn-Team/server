import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { Provider } from 'src/shared/types';
import { LoginRequest } from 'src/presentation/dto/auth/request/login.request';
import { LoginResponse } from 'src/presentation/dto/auth/response/login.response';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post(':provider/login')
    async login(
        @Param('provider') provider: Provider,
        @Body() dto: LoginRequest,
    ): Promise<LoginResponse> {
        const { accessToken } = dto;
        return await this.authService.login(provider, accessToken);
    }
}

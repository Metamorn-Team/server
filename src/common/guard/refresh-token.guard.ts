import { CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { INVALID_TOKEN_MESSAGE } from 'src/domain/exceptions/message';

export class RefreshTokenGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<
            Request & {
                cookies?: { refresh_token: string };
                userId?: string;
            }
        >();

        const refreshToken = req.cookies['refresh_token'];

        const payload = await this.verifyAccessToken(refreshToken);

        req.userId = payload.sub;

        return true;
    }

    private async verifyAccessToken(accessToken: string) {
        try {
            return await this.jwtService.verifyAsync(accessToken);
        } catch (e: unknown) {
            throw new DomainException(
                DomainExceptionType.InvalidToken,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }
    }
}

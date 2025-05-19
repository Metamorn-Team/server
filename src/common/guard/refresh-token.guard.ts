import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';

@Injectable()
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
        const payload = await this.verifyToken(refreshToken);

        req.userId = payload.sub;

        return true;
    }

    private async verifyToken(Token: string) {
        try {
            return await this.jwtService.verifyAsync<{ sub: string }>(Token);
        } catch (e: unknown) {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                e as string,
            );
        }
    }
}

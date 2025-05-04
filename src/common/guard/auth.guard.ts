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
import { INVALID_TOKEN_MESSAGE } from 'src/domain/exceptions/message';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context
            .switchToHttp()
            .getRequest<Request & { userId?: string }>();
        const accessToken = this.extractAccessTokenFromHeader(req);

        const payload = await this.verifyAccessToken(accessToken);

        req.userId = payload.sub;

        return true;
    }

    private async verifyAccessToken(accessToken: string) {
        try {
            return await this.jwtService.verifyAsync<{ sub: string }>(
                accessToken,
            );
        } catch (e: unknown) {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }
    }

    private extractAccessTokenFromHeader(request: Request) {
        const { authorization } = request.headers;
        if (!authorization || authorization.trim() === '') {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }

        return authorization.split(' ')[1];
    }
}

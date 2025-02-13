import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccessTokenUnauthorizedException } from 'src/domain/exceptions/exceptions';

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
            return await this.jwtService.verifyAsync(accessToken);
        } catch (e: unknown) {
            throw new AccessTokenUnauthorizedException();
        }
    }

    private extractAccessTokenFromHeader(request: Request) {
        const { authorization } = request.headers;
        if (!authorization || authorization.trim() === '') {
            throw new AccessTokenUnauthorizedException();
        }

        return authorization.split(' ')[1];
    }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenUnauthorizedException } from 'src/domain/exceptions/exceptions';

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
            throw new TokenUnauthorizedException();
        }
    }

    private extractAccessTokenFromHeader(request: Request) {
        const { authorization } = request.headers;
        if (!authorization || authorization.trim() === '') {
            throw new TokenUnauthorizedException();
        }

        return authorization.split(' ')[1];
    }
}

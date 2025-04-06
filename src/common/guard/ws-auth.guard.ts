import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { INVALID_TOKEN_MESSAGE } from 'src/domain/exceptions/message';

export type AuthenticatedSocket = Socket & { userId: string | undefined };

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();
        const accessToken = this.extractAccessTokenFromClient(client);

        const payload = await this.verifyAccessToken(accessToken);

        client.userId = payload.sub;

        return true;
    }

    private async verifyAccessToken(accessToken: string) {
        try {
            return await this.jwtService.verifyAsync<{ sub: string }>(
                accessToken,
            );
        } catch (e: unknown) {
            throw new DomainException(
                DomainExceptionType.InvalidToken,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }
    }

    private extractAccessTokenFromClient(client: Socket) {
        const authorization = client.handshake.auth.authorization;
        if (
            !authorization ||
            typeof authorization !== 'string' ||
            authorization.trim() === ''
        ) {
            throw new DomainException(
                DomainExceptionType.InvalidToken,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }

        return authorization;
    }
}

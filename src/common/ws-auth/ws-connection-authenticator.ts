import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { INVALID_TOKEN_MESSAGE } from 'src/domain/exceptions/message';

export type AuthenticatedSocket = Socket & { userId?: string };

@Injectable()
export class WsConnectionAuthenticator {
    constructor(private readonly jwtService: JwtService) {}

    async authenticate(client: AuthenticatedSocket): Promise<void> {
        const token = this.extractAccessToken(client);
        const payload = await this.verifyToken(token);
        client.userId = payload.sub;
    }

    private extractAccessToken(client: Socket): string {
        const authorization = client.handshake.auth.authorization as
            | string
            | undefined;

        if (
            !authorization ||
            typeof authorization !== 'string' ||
            authorization.trim() === ''
        ) {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }

        return authorization;
    }

    private async verifyToken(token: string): Promise<{ sub: string }> {
        try {
            return await this.jwtService.verifyAsync<{ sub: string }>(token);
        } catch {
            throw new DomainException(
                DomainExceptionType.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                INVALID_TOKEN_MESSAGE,
            );
        }
    }
}

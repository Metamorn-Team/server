import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { DomainException } from 'src/domain/exceptions/exceptions';
import {
    WsExceptions,
    WsExceptionsType,
} from 'src/presentation/dto/game/socket/known-exception';
import { ErrorToClient } from 'types';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(WsExceptionFilter.name);

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client = ctx.getClient<Socket<any, ErrorToClient>>();

        const name = this.getErrorTypeFromException(exception);
        const message = this.getMessageFromException(exception);

        const res = { name, message };

        this.log(res);
        client.emit('wsError', res);
    }

    private log(res: { name: string; message: string }) {
        if (res.name === 'UNKNOWN') {
            this.logger.error(res);
        } else {
            this.logger.warn(res);
        }
    }

    private getErrorTypeFromException(exception: Error): WsExceptionsType {
        if (exception instanceof DomainException) {
            if (exception.errorType in WsExceptions) {
                return WsExceptions[
                    exception.errorType as keyof typeof WsExceptions
                ];
            }
        }
        return WsExceptions.UNKNOWN;
    }

    private getMessageFromException(exception: Error): string {
        if (exception instanceof DomainException) {
            return exception.message;
        }
        return exception.message;
    }
}

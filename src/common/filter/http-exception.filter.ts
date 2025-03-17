// src/common/filters/http-domain-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from 'src/domain/exceptions/exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        const status = this.getStatusCodeFromException(exception);
        const requestInfo = this.generateRequestInfo(req);
        const errorBody = this.getErrorBodyFromException(exception);

        this.logging(status, requestInfo, errorBody);

        const { error, message, statusCode } = errorBody;
        res.status(status).json({
            status: statusCode,
            message: statusCode === 500 ? 'Server Error' : message,
            error,
        });
    }

    private logging(
        status: HttpStatus,
        requestInfo: ReturnType<typeof this.generateRequestInfo>,
        errorBody: ErrorBody,
    ) {
        if (process.env.NODE_ENV === 'test') return;

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error({ ...requestInfo, errorBody });
            return;
        }

        this.logger.warn({ ...requestInfo, errorBody });
    }

    private getStatusCodeFromException(exception: Error): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }
        if (exception instanceof DomainException) {
            return exception.statusCode;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private getErrorBodyFromException(exception: Error): ErrorBody {
        if (exception instanceof HttpException) {
            const body = exception.getResponse();
            if (typeof body === 'string') {
                return {
                    message: body,
                    error: exception.name,
                    statusCode: exception.getStatus(),
                };
            }
            return body as ErrorBody;
        }

        if (exception instanceof DomainException) {
            let errorBody = {
                message: exception.message,
                statusCode: exception.statusCode,
                error: exception.errorType,
            };
            if ('body' in exception && exception['body']) {
                errorBody = {
                    ...errorBody,
                    ...exception.body,
                };
            }

            return errorBody;
        }

        return {
            message: exception.message,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: exception.name,
        };
    }

    private generateRequestInfo(req: Request) {
        const { ip, path, body, params, query, method } = req;
        const agent = req.header('user-agent') || 'unknown';
        const referer = req.header('referer') || 'unknown';

        return {
            agent,
            ip,
            request: `${method} ${path}`,
            referer,
            body,
            params,
            query,
            timestamp: new Date().toISOString(),
        };
    }
}

interface ErrorBody {
    message: string;
    error: string;
    statusCode: number;
}

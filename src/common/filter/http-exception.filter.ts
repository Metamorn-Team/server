// src/common/filters/http-domain-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        const status = this.getStatusCodeFromException(exception);
        const requestInfo = this.generateRequestInfo(req);
        const errorBody = this.getErrorBodyFromException(exception);

        this.logging(status, requestInfo, errorBody);

        const { statusCode, message } = errorBody;
        res.status(status).json({
            ...errorBody,
            message: statusCode === 500 ? 'Server Error' : message,
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
            return exception.statusCode as number;
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
                statusCode:
                    typeof exception.statusCode === 'number'
                        ? exception.statusCode
                        : HttpStatus.INTERNAL_SERVER_ERROR,
                error: exception.errorType,
            };
            if (this.isExistBodyInException(exception)) {
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

    private isExistBodyInException(
        exception: DomainException<unknown>,
    ): exception is DomainException<object> {
        return 'body' in exception && typeof exception.body === 'object';
    }

    private generateRequestInfo(req: Request) {
        const { ip, path, params, query, method } = req;
        const body: unknown = req.body;
        const agent = req.header('user-agent') || 'unknown';
        const referer = req.header('referer') || 'unknown';

        return {
            agent,
            ip,
            request: `${method} ${path}`,
            referer,
            body: JSON.stringify(body, null, 2),
            params: JSON.stringify(params, null, 2),
            query: JSON.stringify(query, null, 2),
            timestamp: new Date().toISOString(),
        };
    }
}

interface ErrorBody {
    message: string;
    error: string;
    statusCode: number;
}

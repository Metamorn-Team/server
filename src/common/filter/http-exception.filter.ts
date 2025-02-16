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
import {
    BadRequestException,
    ConflictException,
    ErrorBody,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from 'src/domain/exceptions/exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        const body = req.body;
        const params = req.params;
        const query = req.query;
        let status: number;
        let errorMessage: string | object;

        if (exception instanceof Error && 'errorBody' in exception) {
            const errorWithBody = exception as unknown as {
                errorBody: ErrorBody;
            };
            status = this.getStatusCodeFromException(exception);
            errorMessage = errorWithBody.errorBody;

            // 도메인 예외를 HttpException으로 변환
            exception = new HttpException(errorMessage, status);
        } else if (exception instanceof HttpException) {
            // 이미 HttpException인 경우
            status = exception.getStatus();
            errorMessage = exception.getResponse();
        } else {
            // 그 외 예외 (예: 시스템 오류)
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorMessage = {
                code: 'INTERNAL_SERVER_ERROR',
                message: '서버 내부 오류가 발생했습니다.',
                body: body,
            };
        }

        this.logger.error({
            message: 'Exception occured',
            status,
            error: errorMessage,
            path: req.url,
            timestamp: new Date().toISOString(),
            method: req.method,
            body: body,
            params: params,
            query: query,
        });

        res.status(status).json({
            statusCode: status,
            ...(typeof errorMessage === 'object'
                ? errorMessage
                : { message: errorMessage }),
            path: req.url,
            timestamp: new Date().toISOString(),
        });
    }

    private getStatusCodeFromException(exception: Error): number {
        if (exception instanceof BadRequestException) {
            return HttpStatus.BAD_REQUEST;
        } else if (exception instanceof UnauthorizedException) {
            return HttpStatus.UNAUTHORIZED;
        } else if (exception instanceof ForbiddenException) {
            return HttpStatus.FORBIDDEN;
        } else if (exception instanceof NotFoundException) {
            return HttpStatus.NOT_FOUND;
        } else if (exception instanceof ConflictException) {
            return HttpStatus.CONFLICT;
        } else {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}

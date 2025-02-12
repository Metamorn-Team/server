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
import path from 'path';
import {
    BadRequestException,
    ConflictException,
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

        if (exception instanceof ForbiddenException) {
            exception = new HttpException(
                exception.message,
                HttpStatus.FORBIDDEN,
            );
        } else if (exception instanceof BadRequestException) {
            exception = new HttpException(
                exception.message,
                HttpStatus.BAD_REQUEST,
            );
        } else if (exception instanceof NotFoundException) {
            exception = new HttpException(
                exception.message,
                HttpStatus.NOT_FOUND,
            );
        } else if (exception instanceof UnauthorizedException) {
            exception = new HttpException(
                exception.message,
                HttpStatus.UNAUTHORIZED,
            );
        } else if (exception instanceof ConflictException) {
            exception = new HttpException(
                exception.message,
                HttpStatus.CONFLICT,
            );
        }

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorMessage = exception.getResponse();
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorMessage = exception.message;
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
            message: errorMessage,
            path: req.url,
            timestamp: new Date().toISOString(),
        });
    }
}

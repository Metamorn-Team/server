// src/common/filters/http-domain-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from 'src/domain/exceptions/exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor() {}

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        const body = req.body;
        const params = req.params;
        const query = req.query;
        let status: number;
        let errorMessage: string | object;

        const paramMessage = params
            ? ` \nparams: ${JSON.stringify(params, null, 2)}`
            : '';
        const queryMessage = query
            ? ` \nquery: ${JSON.stringify(query, null, 2)}`
            : '';
        const bodyMessage = body
            ? ` \nbody: ${JSON.stringify(body, null, 2)}`
            : '';
        const ipMessage = `\nip: ${req.ip}`;

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

        res.status(status).json({
            statusCode: status,
            message: errorMessage,
            path: req.url,
            timestamp: new Date().toISOString(),
        });
    }
}

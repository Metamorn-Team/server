import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> | Promise<Observable<any>> {
        const startTime = Date.now();
        const ctx = context.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();
        const message = this.generateMessage(req, res);

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - startTime;
                if (process.env.NODE_ENV !== 'test') {
                    this.logger.log({ ...message, duration: `${duration}ms` });
                }
            }),
        );
    }

    private generateMessage(req: Request, res: Response) {
        const { ip, path, body, params, query, method } = req;
        const agent = req.header('user-agent') || 'unknown';
        const referer = req.header('referer') || 'unknown';
        const status = res.statusCode;

        return {
            agent,
            ip,
            request: `${method} ${path}`,
            referer,
            body,
            params,
            query,
            status,
            timestamp: new Date().toISOString(),
        };
    }
}

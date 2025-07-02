import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable, tap } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

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
                    this.logger.info({ ...message, duration: `${duration}ms` });
                }
            }),
        );
    }

    private generateMessage(req: Request, res: Response) {
        const { ip, path, params, query, method } = req;
        const body: unknown = req.body;
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

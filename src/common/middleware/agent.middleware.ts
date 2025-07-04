import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { LiaRequest } from 'src/common/types';
import { UAParser } from 'ua-parser-js';
import { v4 } from 'uuid';

@Injectable()
export class AgentMiddleware implements NestMiddleware {
    use(req: LiaRequest, _: Response, next: NextFunction) {
        const sessionId = req.cookies?.['sessionId']
            ? String(req.cookies?.['sessionId'])
            : v4();

        const ip = this.getClientIp(req);
        const userAgent = this.extractUserAgent(req);

        req.agent = {
            sessionId,
            ...userAgent,
            ip,
        };

        next();
    }

    private getClientIp(req: LiaRequest): string {
        const xForwardedFor = req.headers['x-forwarded-for'];
        if (xForwardedFor) {
            // X-Forwarded-For는 쉼표로 구분된 IP 목록이므로 첫 번째 IP를 사용
            console.log(xForwardedFor);
            return String(xForwardedFor).split(',')[0].trim();
        }

        const xRealIp = req.headers['x-real-ip'];
        if (xRealIp) {
            return String(xRealIp);
        }

        return req.ip || 'unknown';
    }

    private extractUserAgent(req: LiaRequest) {
        const ua = UAParser(req.headers['user-agent']);

        return {
            browser: ua.browser.name,
            device: ua.device.type ? 'mobile' : 'desktop',
            os: ua.os.name,
            model: ua.device.model,
        };
    }
}

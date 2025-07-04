import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LiaRequest } from 'src/common/types';

export const CurrentUserAgent = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<LiaRequest>();
        return req.agent;
    },
);

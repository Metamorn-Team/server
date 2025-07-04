import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LiaRequest } from 'src/common/types';
import { v4 } from 'uuid';

export const SessionId = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<LiaRequest>();
        return req.agent?.sessionId || v4();
    },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedSocket } from 'src/common/guard/ws-auth.guard';

export const CurrentUser = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const req = ctx
            .switchToHttp()
            .getRequest<Request & { userId: string }>();
        return req.userId;
    },
);

export const CurrentUserFromSocket = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
        const userId = client.userId;

        if (!userId) throw new Error();

        return userId;
    },
);

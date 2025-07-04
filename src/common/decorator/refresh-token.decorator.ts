import {
    createParamDecorator,
    ExecutionContext,
    HttpStatus,
} from '@nestjs/common';
import { LiaRequest } from 'src/common/types';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { FORBIDDEN_MESSAGE } from 'src/domain/exceptions/message';

export const CurrentRefreshToken = createParamDecorator(
    (_: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<LiaRequest>();
        const token = String(req.cookies['refresh_token']);

        if (!token) {
            throw new DomainException(
                DomainExceptionType.FORBIDDEN,
                HttpStatus.FORBIDDEN,
                FORBIDDEN_MESSAGE,
            );
        }

        return token;
    },
);

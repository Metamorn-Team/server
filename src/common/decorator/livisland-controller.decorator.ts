import {
    applyDecorators,
    Controller,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { AuthGuard } from 'src/common/guard/auth.guard';

export const LivislandController = (tag: string, isAuth = true) => {
    const decorators = [
        Controller(tag),
        ApiTags(tag),
        UseFilters(HttpExceptionFilter),
        ApiResponse({ status: 400, description: '입력 값 검증 실패' }),
    ];

    if (isAuth) {
        decorators.push(
            UseGuards(AuthGuard),
            ApiResponse({
                status: 401,
                description: '인증 실패 (토큰 누락 또는 만료)',
            }),
            ApiBearerAuth(),
        );
    }

    return applyDecorators(...decorators);
};

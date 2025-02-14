import { Module, Provider } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';

const filters: Provider[] = [
    {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter,
    },
];

@Module({
    providers: [...filters],
})
export class FilterModule {}

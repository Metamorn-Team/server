import { HttpStatus } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';

export class DomainException<T = undefined> extends Error {
    errorType: DomainExceptionType;
    statusCode: HttpStatus;
    body?: T;

    constructor(
        errorType: DomainExceptionType,
        statusCode: HttpStatus,
        message = 'domain error',
        body?: T,
    ) {
        super(message);
        this.errorType = errorType;
        this.statusCode = statusCode;
        this.body = body;
    }
}

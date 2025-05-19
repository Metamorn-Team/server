import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';

export class DomainException<T = unknown> extends Error {
    errorType: DomainExceptionType;
    statusCode?: number | string;
    body?: T;

    constructor(
        errorType: DomainExceptionType,
        statusCode?: number | string,
        message = 'domain error',
        body?: T,
    ) {
        super(message);
        this.errorType = errorType;
        this.statusCode = statusCode || errorType;
        this.body = body;
    }
}

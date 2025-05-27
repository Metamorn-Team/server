import {
    ArgumentMetadata,
    HttpException,
    ValidationPipe,
    ValidationPipeOptions,
} from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';

export class WsValidatePipe extends ValidationPipe {
    constructor(options?: ValidationPipeOptions) {
        super(options);
    }

    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        try {
            return await super.transform(value, metadata);
        } catch (e: unknown) {
            if (e instanceof HttpException) {
                const errorBody = e.getResponse() as {
                    error: string;
                    statusCode: number;
                    message: string[];
                };
                throw new DomainException(
                    DomainExceptionType.BAD_INPUT,
                    errorBody.statusCode,
                    JSON.stringify(errorBody.message),
                );
            }
            throw e;
        }
    }
}

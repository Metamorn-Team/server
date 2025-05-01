import {
    ArgumentMetadata,
    HttpException,
    ValidationPipe,
    ValidationPipeOptions,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class WsValidatePipe extends ValidationPipe {
    constructor(options?: ValidationPipeOptions) {
        super(options);
    }

    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        try {
            return await super.transform(value, metadata);
        } catch (e: unknown) {
            if (e instanceof HttpException) {
                throw new WsException(e.getResponse());
            }
            throw e;
        }
    }
}

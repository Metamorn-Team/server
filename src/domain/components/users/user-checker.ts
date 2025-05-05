import { HttpStatus, Injectable } from '@nestjs/common';
import { UserReader } from './user-reader';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { USER_EMAIL_CONFLIC_MESSAGE } from 'src/domain/exceptions/message';
import { Provider } from 'src/shared/types';

@Injectable()
export class UserChecker {
    constructor(private readonly userReader: UserReader) {}

    async checkDuplicateEmail(email: string, provider: Provider) {
        try {
            const user = await this.userReader.readOneByEmail(email);

            if (user && user.provider !== provider) {
                throw new DomainException(
                    DomainExceptionType.USER_EMAIL_CONFLICT,
                    HttpStatus.CONFLICT,
                    USER_EMAIL_CONFLIC_MESSAGE,
                );
            }
        } catch (_: unknown) {
            return;
        }
    }
}

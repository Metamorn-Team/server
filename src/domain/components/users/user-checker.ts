import { HttpStatus, Injectable } from '@nestjs/common';
import { UserReader } from './user-reader';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import {
    USER_EMAIL_CONFLIC_MESSAGE,
    USER_TAG_CONFLIC_MESSAGE,
} from 'src/domain/exceptions/message';

@Injectable()
export class UserChecker {
    constructor(private readonly userReader: UserReader) {}

    async checkDuplicateEmail(email: string) {
        try {
            const user = await this.userReader.readOneByEmail(email);

            if (user) {
                throw new DomainException(
                    DomainExceptionType.USER_EMAIL_CONFLICT,
                    HttpStatus.CONFLICT,
                    USER_EMAIL_CONFLIC_MESSAGE,
                );
            }
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.USER_EMAIL_CONFLICT
            ) {
                throw e;
            }

            return;
        }
    }

    async checkDuplicateTag(tag: string) {
        try {
            const user = await this.userReader.readOneByTag(tag);

            if (user) {
                throw new DomainException(
                    DomainExceptionType.USER_TAG_CONFLICT,
                    HttpStatus.CONFLICT,
                    USER_TAG_CONFLIC_MESSAGE,
                );
            }
        } catch (e: unknown) {
            if (
                e instanceof DomainException &&
                e.errorType === DomainExceptionType.USER_TAG_CONFLICT
            ) {
                throw e;
            }

            return;
        }
    }
}

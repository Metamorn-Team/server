import { HttpStatus, Injectable } from '@nestjs/common';
import { PrivateIslandReader } from 'src/domain/components/islands/private-island-reader';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { PASSWORD_NOT_MATCH_MESSAGE } from 'src/domain/exceptions/message';

@Injectable()
export class PrivateIslandPasswordChecker {
    constructor(private readonly privateIslandReader: PrivateIslandReader) {}

    async checkPassword(id: string, password: string): Promise<void> {
        const island = await this.privateIslandReader.readPassword(id);
        if (island.password && island.password !== password) {
            throw new DomainException(
                DomainExceptionType.PASSWORD_NOT_MATCH,
                HttpStatus.FORBIDDEN,
                PASSWORD_NOT_MATCH_MESSAGE,
            );
        }
    }
}

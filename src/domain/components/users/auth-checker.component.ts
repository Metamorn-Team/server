import { Injectable } from '@nestjs/common';
import { UserReader } from './user-redear.component';

@Injectable()
export class UserCheckerComponent {
    constructor(private readonly userReader: UserReader) {}

    async isValidEmail(email: string) {
        try {
            await this.userReader.readOneByEmail(email);
        } catch (e: unknown) {}
    }
}

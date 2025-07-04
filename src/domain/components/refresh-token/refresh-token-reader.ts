import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from 'src/domain/interface/refresh-token.repository';

@Injectable()
export class RefreshTokenReader {
    constructor(
        @Inject(RefreshTokenRepository)
        private readonly refreshTokenRepository: RefreshTokenRepository,
    ) {}

    async readOneByToken(token: string) {
        return await this.refreshTokenRepository.findByToken(token);
    }
}

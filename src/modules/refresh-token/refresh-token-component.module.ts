import { Module } from '@nestjs/common';
import { RefreshTokenReader } from 'src/domain/components/refresh-token/refresh-token-reader';
import { RefreshTokenWriter } from 'src/domain/components/refresh-token/refresh-token-writer';
import { RefreshTokenRepository } from 'src/domain/interface/refresh-token.repository';
import { RefreshTokenPrismaRepository } from 'src/infrastructure/repositories/refresh-token-prisma.repository';

@Module({
    providers: [
        RefreshTokenWriter,
        RefreshTokenReader,
        {
            provide: RefreshTokenRepository,
            useClass: RefreshTokenPrismaRepository,
        },
    ],
    exports: [RefreshTokenWriter, RefreshTokenReader],
})
export class RefreshTokenComponentModule {}

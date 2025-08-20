import { Module } from '@nestjs/common';
import { PrivateIslandWriter } from 'src/domain/components/islands/private-island-writer';
import { PrivateIslandReader } from 'src/domain/components/islands/private-island-reader';
import { PrivateIslandRepository } from 'src/domain/interface/private-island.repository';
import { PrivateIslandPrismaRepository } from 'src/infrastructure/repositories/private-island-prisma.repository';

@Module({
    providers: [
        PrivateIslandWriter,
        PrivateIslandReader,
        {
            provide: PrivateIslandRepository,
            useClass: PrivateIslandPrismaRepository,
        },
    ],
    exports: [PrivateIslandWriter, PrivateIslandReader],
})
export class PrivateIslandComponentModule {}

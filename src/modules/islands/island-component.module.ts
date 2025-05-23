import { Module } from '@nestjs/common';
import { IslandReader } from 'src/domain/components/islands/island-reader';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { IslandPrismaRepository } from 'src/infrastructure/repositories/island-prisma.repository';

@Module({
    providers: [
        IslandReader,
        IslandWriter,
        { provide: IslandRepository, useClass: IslandPrismaRepository },
    ],
    exports: [IslandReader, IslandWriter],
})
export class IslandComponentModule {}

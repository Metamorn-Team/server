import { Module } from '@nestjs/common';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { IslandPrismaRepository } from 'src/infrastructure/repositories/island-prisma.repository';

@Module({
    providers: [
        IslandWriter,
        { provide: IslandRepository, useClass: IslandPrismaRepository },
    ],
    exports: [IslandWriter],
})
export class IslandComponentModule {}

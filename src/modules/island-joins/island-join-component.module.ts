import { Module } from '@nestjs/common';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { IslandJoinRepository } from 'src/domain/interface/island-join.repository';
import { IslandJoinPrismaRepository } from 'src/infrastructure/repositories/island-join-prisma.repository';

@Module({
    providers: [
        IslandJoinWriter,
        { provide: IslandJoinRepository, useClass: IslandJoinPrismaRepository },
    ],
    exports: [IslandJoinWriter],
})
export class IslandJoinComponentModule {}

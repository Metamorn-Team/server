import { Module } from '@nestjs/common';
import { IslandTagWriter } from 'src/domain/components/island-tags/island-tag-writer';
import { IslandTagRepository } from 'src/domain/interface/island-tag.repository';
import { IslandTagPrismaRepository } from 'src/infrastructure/repositories/island-tag-prisma.repository';

@Module({
    providers: [
        IslandTagWriter,
        { provide: IslandTagRepository, useClass: IslandTagPrismaRepository },
    ],
    exports: [IslandTagWriter],
})
export class IslandTagComponentModule {}

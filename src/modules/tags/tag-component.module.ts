import { Module } from '@nestjs/common';
import { TagReader } from 'src/domain/components/tags/tag-reader';
import { TagRepository } from 'src/domain/interface/tag.repository';
import { TagPrismaRepository } from 'src/infrastructure/repositories/tag-prisma.repository';

@Module({
    providers: [
        TagReader,
        { provide: TagRepository, useClass: TagPrismaRepository },
    ],
    exports: [TagReader],
})
export class TagComponentModule {}

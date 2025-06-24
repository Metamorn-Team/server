import { Module } from '@nestjs/common';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { IslandActiveObjectStorage } from 'src/infrastructure/memories/island-active-object-storage';

@Module({
    providers: [
        IslandActiveObjectReader,
        IslandActiveObjectWriter,
        IslandActiveObjectStorage,
    ],
    exports: [IslandActiveObjectReader, IslandActiveObjectWriter],
})
export class IslandActiveObjectComponentModule {}

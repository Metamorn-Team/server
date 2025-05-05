import { Module } from '@nestjs/common';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { DesertedIslandMemoryStorage } from 'src/infrastructure/storages/deserted-island-memory-storage';

@Module({
    providers: [
        {
            provide: DesertedIslandStorage,
            useClass: DesertedIslandMemoryStorage,
        },
    ],
    exports: [DesertedIslandStorage],
})
export class DesertedIslandStorageModule {}

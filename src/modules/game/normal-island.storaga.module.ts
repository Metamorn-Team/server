import { Module } from '@nestjs/common';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { NormalIslandMemoryStorage } from 'src/infrastructure/storages/normal-island-memory-storage';

@Module({
    providers: [
        {
            provide: NormalIslandStorage,
            useClass: NormalIslandMemoryStorage,
        },
    ],
    exports: [NormalIslandStorage],
})
export class NormalIslandStorageModule {}

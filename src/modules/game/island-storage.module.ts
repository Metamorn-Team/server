import { Module } from '@nestjs/common';
import { IslandStorage } from 'src/domain/interface/storages/island-storage';
import { IslandMemoryStorage } from 'src/infrastructure/storages/island-memory-storage';

@Module({
    providers: [{ provide: IslandStorage, useClass: IslandMemoryStorage }],
    exports: [{ provide: IslandStorage, useClass: IslandMemoryStorage }],
})
export class IslandStorageModule {}

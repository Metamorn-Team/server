import { Injectable } from '@nestjs/common';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { IslandReader } from 'src/domain/components/islands/interface/island-reader';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class IslandStorageReaderFactory {
    constructor(
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
    ) {}

    get(type: IslandTypeEnum): IslandReader {
        switch (type) {
            case IslandTypeEnum.NORMAL:
                return this.normalIslandStorageReader;
            case IslandTypeEnum.DESERTED:
                return this.desertedIslandStorageReader;
            default:
                throw new Error(`Unknown island`);
        }
    }
}

import { Injectable } from '@nestjs/common';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { IslandTypeEnum } from 'src/domain/types/island.types';

interface IslandReaderTypeMap {
    [IslandTypeEnum.NORMAL]: NormalIslandStorageReader;
    [IslandTypeEnum.DESERTED]: DesertedIslandStorageReader;
}

@Injectable()
export class IslandStorageReaderFactory {
    constructor(
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
    ) {}

    get<T extends IslandTypeEnum>(type: T): IslandReaderTypeMap[T] {
        switch (type) {
            case IslandTypeEnum.NORMAL:
                return this.normalIslandStorageReader as IslandReaderTypeMap[T];
            case IslandTypeEnum.DESERTED:
                return this
                    .desertedIslandStorageReader as IslandReaderTypeMap[T];
            default:
                throw new Error(`Unknown island type: ${type}`);
        }
    }
}

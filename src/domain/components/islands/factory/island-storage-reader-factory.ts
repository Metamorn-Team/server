import { Injectable } from '@nestjs/common';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { IslandReader } from 'src/domain/components/islands/interface/island-reader';
import { LivePrivateIslandReader } from 'src/domain/components/islands/live-private-island-reader';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class IslandStorageReaderFactory {
    constructor(
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly livePrivateIslandReader: LivePrivateIslandReader,
    ) {}

    get(type: IslandTypeEnum): IslandReader {
        switch (type) {
            case IslandTypeEnum.NORMAL:
                return this.normalIslandStorageReader;
            case IslandTypeEnum.DESERTED:
                return this.desertedIslandStorageReader;
            case IslandTypeEnum.PRIVATE:
                return this.livePrivateIslandReader;
            default:
                throw new Error(`Unknown island`);
        }
    }
}

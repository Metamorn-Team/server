import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IslandActiveObjectSpawner } from 'src/domain/components/island-spawn-object/island-active-object-spawner';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { MapReader } from 'src/domain/components/map/map-reader';

@Injectable()
export class IslandLoader implements OnModuleInit {
    private readonly logger = new Logger(IslandLoader.name);

    constructor(
        private readonly islandActiveObjectSpawner: IslandActiveObjectSpawner,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
        private readonly mapReader: MapReader,
    ) {}

    async onModuleInit() {
        if (process.env.NODE_ENV === 'test') return;
        const normalIslands = await this.normalIslandStorageReader.readAll();
        const desertedIslands =
            await this.desertedIslandStorageReader.readAll();

        const mapKeyMap = await this.mapReader.getMapKeyMap();

        const allIslands = [...normalIslands, ...desertedIslands];
        const islandPromises = allIslands.map(
            async (island) =>
                await this.islandActiveObjectSpawner.spawnInitialObjects(
                    island.id,
                    mapKeyMap[island.mapKey],
                ),
        );

        const spawnedObjects = await Promise.all(islandPromises);

        this.logger.log(`${allIslands.length}개의 섬`);
        this.logger.log(`${spawnedObjects.length}개의 오브젝트 스폰`);
    }
}

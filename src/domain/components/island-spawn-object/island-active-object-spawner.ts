import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { IslandObjectWriter } from 'src/domain/components/island-spawn-object/island-object-writer';
import { SpawnZoneReader } from 'src/domain/components/spawn-zone/spawn-zone-reader';
import {
    ActiveObject,
    PersistentObject,
} from 'src/domain/types/spawn-object/active-object';

@Injectable()
export class IslandActiveObjectSpawner {
    constructor(
        private readonly spawnZoneReader: SpawnZoneReader,
        private readonly islandObjectWriter: IslandObjectWriter,
        private readonly islandActiveObjectWriter: IslandActiveObjectWriter,
    ) {}

    async spawnInitialObjects(islandId: string, mapId: string) {
        // 해당 맵의 오브젝트 스폰 좌표
        const spawnZones = await this.spawnZoneReader.readAllByMapId(mapId);

        const objects = spawnZones.map((spawnZone) =>
            PersistentObject.fromSpawnZone(islandId, spawnZone, v4),
        );
        // Redis I/O
        await this.islandObjectWriter.createMany(objects);
        const activeObjects = objects.map((object) =>
            ActiveObject.fromPersistentObject(object),
        );

        // Memory I/O
        this.islandActiveObjectWriter.createMany(activeObjects);

        return activeObjects;
    }
}

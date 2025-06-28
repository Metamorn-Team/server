import { Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { IslandActiveObjectWriter } from 'src/domain/components/island-spawn-object/island-active-object-writer';
import { SpawnZoneReader } from 'src/domain/components/spawn-zone/spawn-zone-reader';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';
import { RespawnQueueManager } from 'src/domain/components/island-spawn-object/respawn-queue-manager';

@Injectable()
export class IslandActiveObjectSpawner {
    private readonly logger = new Logger(IslandActiveObjectSpawner.name);

    constructor(
        private readonly spawnZoneReader: SpawnZoneReader,
        private readonly islandActiveObjectWriter: IslandActiveObjectWriter,
        private readonly islandActiveObjectReader: IslandActiveObjectReader,
        private readonly respawnQueueManager: RespawnQueueManager,
    ) {}

    async spawnInitialObjects(islandId: string, mapId: string) {
        // 해당 맵의 오브젝트 스폰 정보
        const spawnZones = await this.spawnZoneReader.readAllByMapId(mapId);

        const activeObjects = spawnZones.map((spawnZone) =>
            ActiveObject.from({ ...spawnZone, islandId }, v4),
        );
        this.islandActiveObjectWriter.createMany(activeObjects);

        return activeObjects;
    }

    respawn() {
        const readyToRespawnObjectInfos =
            this.respawnQueueManager.getReadyToRespawn(Date.now());

        const respawnObjects: ActiveObject[] = [];
        readyToRespawnObjectInfos.forEach((objectInfo) => {
            try {
                const object = this.islandActiveObjectReader.readOne(
                    objectInfo.islandId,
                    objectInfo.objectId,
                );

                object.revive();
                respawnObjects.push(object);
            } catch (e: unknown) {
                const log = {
                    islandId: objectInfo.islandId,
                    objectId: objectInfo.objectId,
                    message: `respawn 오류: ${e instanceof Error ? e.message : JSON.stringify(e)}`,
                };
                this.logger.error(log);
            }
        });

        return respawnObjects;
    }

    registerForRespawn(objects: ActiveObject[], now = new Date()) {
        // 한 번에 들어오는 오브젝트는 항상 같은 섬임
        const islandId = objects[0].islandId;

        this.respawnQueueManager.addMany(
            objects.map((object) => ({
                objectId: object.id,
                islandId,
                respawnTime: now.getTime() + object.respawnTime * 1000 * 60,
            })),
        );
        this.logger.debug('큐 상태');
        this.logger.debug(this.respawnQueueManager.getAll());
    }
}

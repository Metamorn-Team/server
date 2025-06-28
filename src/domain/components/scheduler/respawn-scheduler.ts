import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IslandActiveObjectSpawner } from 'src/domain/components/island-spawn-object/island-active-object-spawner';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import { RespawnGateway } from 'src/presentation/gateway/respawn.gateway';

type RespawnedObjectsByIslandId = Record<string, ActiveObject[]>;

@Injectable()
export class RespawnScheduler {
    private readonly logger = new Logger(RespawnScheduler.name);

    constructor(
        private readonly islandActiveObjectSpawner: IslandActiveObjectSpawner,
        private readonly respawnGateway: RespawnGateway,
    ) {}

    @Cron('*/3 * * * * *', {
        name: 'respawn',
    }) // 3초마다 실행
    handleRespawn() {
        try {
            const respawnedObjects = this.islandActiveObjectSpawner.respawn();

            if (respawnedObjects.length > 0) {
                const respawnedObjectsByIslandId =
                    this.mapRespawnedObjectsByIslandId(respawnedObjects);

                this.broadcastRespawn(respawnedObjectsByIslandId);

                this.logger.debug(
                    `리스폰 완료: ${respawnedObjects.length}개 오브젝트`,
                );
                this.logger.debug(
                    respawnedObjects.map((obj) => ({
                        id: obj.id,
                        islandId: obj.islandId,
                        type: obj.type,
                    })),
                );
            }
        } catch (e: unknown) {
            this.logger.error(
                `리스폰 처리 중 오류 발생: ${e instanceof Error ? e.message : JSON.stringify(e)}`,
            );
        }
    }

    broadcastRespawn(respawnedObjectsByIslandId: RespawnedObjectsByIslandId) {
        Object.entries(respawnedObjectsByIslandId).forEach(
            ([islandId, respawnedObjects]) => {
                this.respawnGateway.spawnObjects(islandId, respawnedObjects);
            },
        );
    }

    mapRespawnedObjectsByIslandId(respawnedObjects: ActiveObject[]) {
        return respawnedObjects.reduce((acc, obj) => {
            if (!acc[obj.islandId]) {
                acc[obj.islandId] = [];
            }
            acc[obj.islandId].push(obj);
            return acc;
        }, {} as RespawnedObjectsByIslandId);
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IslandActiveObjectSpawner } from 'src/domain/components/island-spawn-object/island-active-object-spawner';

@Injectable()
export class RespawnScheduler {
    private readonly logger = new Logger(RespawnScheduler.name);

    constructor(
        private readonly islandActiveObjectSpawner: IslandActiveObjectSpawner,
    ) {}

    @Cron('*/3 * * * * *') // 3초마다 실행
    handleRespawn() {
        try {
            const respawnedObjects = this.islandActiveObjectSpawner.respawn();
            this.logger.log('리스폰 스케줄 실행');

            if (respawnedObjects.length > 0) {
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
}

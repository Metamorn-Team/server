import { Inject, Injectable } from '@nestjs/common';
import {
    RespawnQueueObject,
    RespawnQueueStorage,
} from 'src/domain/interface/storages/respawn-queue-storage';

@Injectable()
export class RespawnQueueManager {
    constructor(
        @Inject(RespawnQueueStorage)
        private readonly respawnQueueStorage: RespawnQueueStorage,
    ) {}

    /**
     * @param object 리스폰 큐에 추가할 오브젝트 정보
     *
     * respawnTime: 리스폰될 시간(ms) 현재 시간 + 리스폰 시간
     */
    async add(islandId: string, object: RespawnQueueObject): Promise<void> {
        await this.respawnQueueStorage.add(islandId, object);
    }

    /**
     * @param objects 리스폰 큐에 추가할 오브젝트 정보
     *
     * respawnTime: 리스폰될 시간(ms) 현재 시간 + 리스폰 시간
     */
    async addMany(
        islandId: string,
        objects: RespawnQueueObject[],
    ): Promise<void> {
        await this.respawnQueueStorage.addMany(islandId, objects);
    }

    async remove(objectId: string): Promise<void> {
        await this.respawnQueueStorage.remove(objectId);
    }

    async removeMany(objectIds: string[]): Promise<void> {
        await this.respawnQueueStorage.removeMany(objectIds);
    }

    async removeAllByIslandId(islandId: string): Promise<void> {
        await this.respawnQueueStorage.removeAllByIslandId(islandId);
    }
}

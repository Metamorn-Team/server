import { Injectable } from '@nestjs/common';

interface RespawnQueueItem {
    islandId: string;
    objectId: string;
    respawnTime: number;
}

@Injectable()
export class RespawnQueueManager {
    private readonly queue: RespawnQueueItem[] = [];

    /**
     * 여러 오브젝트를 리스폰 대기열에 추가합니다.
     * @param islandId 섬 ID
     * @param items 리스폰할 오브젝트 정보 배열
     */
    addMany(items: RespawnQueueItem[]) {
        const queueItems: RespawnQueueItem[] = items.map((item) => ({
            respawnTime: item.respawnTime,
            objectId: item.objectId,
            islandId: item.islandId,
        }));

        this.queue.push(...queueItems);
        this.sortQueue();
    }

    /**
     * 단일 오브젝트를 리스폰 대기열에 추가합니다.
     * @param islandId 섬 ID
     * @param objectId 오브젝트 ID
     * @param respawnTime 리스폰 시간
     */
    addOne(item: RespawnQueueItem) {
        const queueItem: RespawnQueueItem = {
            islandId: item.islandId,
            objectId: item.objectId,
            respawnTime: item.respawnTime,
        };

        this.queue.push(queueItem);
        this.sortQueue();
    }

    /**
     * 현재 시간에 리스폰할 수 있는 오브젝트들을 가져옵니다.
     * @param currentTime 현재 시간 (timestamp)
     * @returns 리스폰할 오브젝트 정보 배열
     */
    getReadyToRespawn(currentTime: number): RespawnQueueItem[] {
        const readyItems: RespawnQueueItem[] = [];
        let i = 0;

        while (
            i < this.queue.length &&
            this.queue[i].respawnTime <= currentTime
        ) {
            readyItems.push(this.queue[i]);
            i++;
        }

        // 리스폰할 준비가 된 아이템들을 큐에서 제거
        this.queue.splice(0, i);

        return readyItems;
    }

    /**
     * 특정 섬의 모든 리스폰 대기열 데이터를 삭제합니다.
     * @param islandId 섬 ID
     */
    removeAllByIslandId(islandId: string) {
        for (let i = this.queue.length - 1; i >= 0; i--) {
            if (this.queue[i].islandId === islandId) {
                this.queue.splice(i, 1);
            }
        }
    }

    /**
     * 특정 섬의 리스폰 대기열 데이터를 가져옵니다.
     * @param islandId 섬 ID
     * @returns 해당 섬의 리스폰 대기열 데이터
     */
    getByIslandId(islandId: string): RespawnQueueItem[] {
        return this.queue.filter((item) => item.islandId === islandId);
    }

    /**
     * 전체 리스폰 대기열을 가져옵니다.
     * @returns 전체 리스폰 대기열 데이터
     */
    getAll(): RespawnQueueItem[] {
        return [...this.queue];
    }

    /**
     * 리스폰 대기열의 크기를 반환합니다.
     * @returns 큐의 크기
     */
    getSize(): number {
        return this.queue.length;
    }

    /**
     * 리스폰 대기열을 respawnTime 기준으로 오름차순 정렬합니다.
     */
    private sortQueue() {
        this.queue.sort((a, b) => a.respawnTime - b.respawnTime);
    }

    /**
     * 전체 리스폰 대기열을 비웁니다.
     */
    clear() {
        // 배열 length를 0으로 설정하면 배열 비워지더라..
        this.queue.length = 0;
    }
}

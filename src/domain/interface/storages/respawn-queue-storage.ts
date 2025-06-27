export interface RespawnQueueObject {
    objectId: string;
    respawnTime: number;
}

export interface RespawnQueueStorage {
    add(islandId: string, object: RespawnQueueObject): Promise<void>;
    addMany(islandId: string, objects: RespawnQueueObject[]): Promise<void>;
    remove(objectId: string): Promise<void>;
    removeMany(objectIds: string[]): Promise<void>;
    removeAllByIslandId(islandId: string): Promise<void>;
}

export const RespawnQueueStorage = Symbol('RespawnQueueStorage');

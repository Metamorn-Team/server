import { PersistentObject } from 'src/domain/types/spawn-object/active-object';

export interface IslandObjectStorage {
    create(object: PersistentObject): Promise<void>;
    createMany(objects: PersistentObject[]): Promise<void>;
    readAll(): Promise<PersistentObject[]>;
    deleteAllByIslandId(islandId: string): Promise<void>;
}

export const IslandObjectStorage = Symbol('IslandObjectStorage');

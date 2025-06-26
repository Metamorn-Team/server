import { PersistentObject } from 'src/domain/types/spawn-object/active-object';

export interface IslandObjectStorage {
    create(object: PersistentObject): Promise<void>;
    createMany(objects: PersistentObject[]): Promise<void>;
    readAll(): Promise<PersistentObject[]>;
    readAllByIslandId(islandId: string): Promise<PersistentObject[]>;
    deleteAllByIslandId(islandId: string): Promise<void>;
    markAsDead(islandId: string, ids: string[]): Promise<void>;
    markAsAlive(islandId: string, ids: string[]): Promise<void>;
}

export const IslandObjectStorage = Symbol('IslandObjectStorage');

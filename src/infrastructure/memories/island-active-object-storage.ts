import { Injectable } from '@nestjs/common';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';

@Injectable()
export class IslandActiveObjectStorage {
    private readonly islandObjectsStorage = new Map<
        string,
        Map<string, ActiveObject>
    >();

    create(object: ActiveObject): void {
        const islandObjects =
            this.islandObjectsStorage.get(object.islandId) ||
            new Map<string, ActiveObject>();

        islandObjects.set(object.id, object);
        this.islandObjectsStorage.set(object.islandId, islandObjects);
    }

    createMany(objects: ActiveObject[]): void {
        objects.forEach((object) => this.create(object));
    }

    readAll(islandId: string): ActiveObject[] {
        return Array.from(
            this.islandObjectsStorage.get(islandId)?.values() || [],
        );
    }

    readByIds(islandId: string, ids: string[]): ActiveObject[] {
        const islandObjects = this.islandObjectsStorage.get(islandId);
        if (!islandObjects) return [];

        return ids
            .map((id) => islandObjects.get(id))
            .filter((object) => !!object);
    }

    deleteAllByIslandId(islandId: string): void {
        this.islandObjectsStorage.delete(islandId);
    }

    delete(islandId: string, id: string): void {
        const objects = this.islandObjectsStorage.get(islandId);
        if (!objects) return;

        objects.delete(id);
    }
}

import { SpawnObject } from 'src/domain/types/spawn-object/spawn-object';

export interface SpawnZone {
    readonly id: string;
    readonly mapId: string;
    readonly gridX: number;
    readonly gridY: number;
    readonly spawnObject: SpawnObject;
}

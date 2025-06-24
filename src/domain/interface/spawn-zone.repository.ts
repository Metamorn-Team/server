import { SpawnZone } from 'src/domain/types/spawn-zone';

export interface SpawnZoneRepository {
    findByMapId(mapId: string): Promise<SpawnZone[]>;
}

export const SpawnZoneRepository = Symbol('SpawnZoneRepository');

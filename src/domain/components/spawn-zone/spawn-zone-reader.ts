import { Inject, Injectable } from '@nestjs/common';
import { SpawnZoneRepository } from 'src/domain/interface/spawn-zone.repository';
import { SpawnZone } from 'src/domain/types/spawn-zone';

@Injectable()
export class SpawnZoneReader {
    constructor(
        @Inject(SpawnZoneRepository)
        private readonly spawnZoneRepository: SpawnZoneRepository,
    ) {}

    async readAllByMapId(mapId: string): Promise<SpawnZone[]> {
        return this.spawnZoneRepository.findByMapId(mapId);
    }
}

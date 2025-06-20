import { Inject, Injectable } from '@nestjs/common';
import { PlayerSpawnPointRepository } from 'src/domain/interface/player-spawn-point.repository';
import { PlayerSpawnPoint } from 'src/domain/types/player-spawn-point.types';

@Injectable()
export class PlayerSpawnPointReader {
    constructor(
        @Inject(PlayerSpawnPointRepository)
        private readonly playerSpawnPointRepository: PlayerSpawnPointRepository,
    ) {}

    async readAll(mapId: string): Promise<PlayerSpawnPoint[]> {
        return await this.playerSpawnPointRepository.findAll(mapId);
    }

    async readAllByKey(mapKey: string): Promise<PlayerSpawnPoint[]> {
        return await this.playerSpawnPointRepository.findAllByKey(mapKey);
    }

    async readRandomPoint(mapKey: string): Promise<PlayerSpawnPoint> {
        const points = await this.readAllByKey(mapKey);
        return points[Math.floor(Math.random() * points.length)];
    }
}

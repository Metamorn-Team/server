import { PlayerSpawnPoint } from 'src/domain/types/player-spawn-point.types';

export interface PlayerSpawnPointRepository {
    findAll(mapId: string): Promise<PlayerSpawnPoint[]>;
    findAllByKey(mapKey: string): Promise<PlayerSpawnPoint[]>;
}

export const PlayerSpawnPointRepository = Symbol('PlayerSpawnPointRepository');

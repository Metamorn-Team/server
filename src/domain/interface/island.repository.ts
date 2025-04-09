import { IslandEntity } from 'src/domain/entities/islands/island.entity';

export interface IslandRepository {
    save(data: IslandEntity): Promise<void>;
}

export const IslandRepository = Symbol('IslandRepository');

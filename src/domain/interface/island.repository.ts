import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { Island } from 'src/domain/types/game.types';

export interface IslandRepository {
    save(data: IslandEntity): Promise<void>;
    findOneById(id: string): Promise<Island | null>;
}

export const IslandRepository = Symbol('IslandRepository');

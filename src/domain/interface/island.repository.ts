import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { Island } from 'src/domain/types/game.types';
import { IslandSummary } from 'src/domain/types/island.types';

export interface IslandRepository {
    save(data: IslandEntity): Promise<void>;
    findOneById(id: string): Promise<Island | null>;
    findSummaryById(id: string): Promise<IslandSummary | null>;
    update(id: string, data: Partial<IslandEntity>): Promise<void>;
    delete(id: string): Promise<void>;
}

export const IslandRepository = Symbol('IslandRepository');

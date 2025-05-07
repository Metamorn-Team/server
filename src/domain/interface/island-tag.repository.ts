import { IslandTagEntity } from 'src/domain/entities/tag/island-tag.entity';

export interface IslandTagRepository {
    saveMany(data: IslandTagEntity[]): Promise<void>;
}

export const IslandTagRepository = Symbol('IslandTagRepository');

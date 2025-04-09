import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';

export interface IslandJoinRepository {
    save(data: IslandJoinEntity): Promise<void>;
}

export const IslandJoinRepository = Symbol('IslandJoinRepository');

import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';

export interface IslandJoinRepository {
    save(data: IslandJoinEntity): Promise<void>;
    update(userId: string, islandId: string, leftAt: Date): Promise<void>;
}

export const IslandJoinRepository = Symbol('IslandJoinRepository');

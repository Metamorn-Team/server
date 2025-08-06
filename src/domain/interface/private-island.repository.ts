import { PrivateIslandEntity } from 'src/domain/entities/islands/private-island.entity';
import {
    GetPaginatedMyIslandsInput,
    PrivateIsland,
} from 'src/domain/types/private-island.types';

export interface PrivateIslandRepository {
    create(data: PrivateIslandEntity): Promise<void>;
    existByUrlPath(urlPath: string): Promise<boolean>;
    findPaginatedMine(
        input: GetPaginatedMyIslandsInput,
    ): Promise<PrivateIsland[]>;
    countByOwner(ownerId: string): Promise<number>;
}

export const PrivateIslandRepository = Symbol('PrivateIslandRepository');

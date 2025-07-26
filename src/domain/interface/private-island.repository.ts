import { PrivateIslandEntity } from 'src/domain/entities/islands/private-island.entity';

export interface PrivateIslandRepository {
    create(data: PrivateIslandEntity): Promise<void>;
    existByUrlPath(urlPath: string): Promise<boolean>;
}

export const PrivateIslandRepository = Symbol('PrivateIslandRepository');

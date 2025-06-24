import { Map } from 'src/domain/types/map.types';

export interface MapRepository {
    findByKey(key: string): Promise<Map | null>;
    findAll(): Promise<Map[]>;
}

export const MapRepository = Symbol('MapRepository');

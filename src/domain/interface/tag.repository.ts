import { Tag } from 'src/domain/types/tag.types';

export interface TagRepository {
    findOneByName(name: string): Promise<Tag | null>;
    findByNames(names: string[]): Promise<Tag[]>;
    findAll(): Promise<Tag[]>;
}

export const TagRepository = Symbol('TagRepository');

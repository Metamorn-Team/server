export interface ItemRepository {
    existById(id: string): Promise<boolean>;
}

export const ItemRepository = Symbol('ItemRepository');

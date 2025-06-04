import { ItemTypeEnum } from 'src/domain/types/item.types';

export interface ItemPrototype {
    readonly name: string;
    readonly description: string;
    readonly type: string;
    readonly itemType: ItemTypeEnum;
    readonly key: string;
    readonly grade: number;
    readonly image: string;
}

export class ItemEntity {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly description: string,
        readonly type: string,
        readonly itemType: ItemTypeEnum,
        readonly key: string,
        readonly grade: number,
        readonly image: string,
        readonly createdAt: Date,
    ) {}

    static create(proto: ItemPrototype, idGen: () => string, stdDate: Date) {
        return new ItemEntity(
            idGen(),
            proto.name,
            proto.description,
            proto.type,
            proto.itemType,
            proto.key,
            proto.grade,
            proto.image,
            stdDate,
        );
    }
}

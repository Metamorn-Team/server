import { ProductTypeEnum } from 'src/domain/types/product.types';

interface ProductPrototype {
    readonly ItemId: string;
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly coverImage: string;
    readonly productType: ProductTypeEnum;
}

export class ProducEntity {
    constructor(
        readonly id: string,
        readonly itemId: string,
        readonly name: string,
        readonly description: string,
        readonly price: number,
        readonly coverImage: string,
        readonly productType: ProductTypeEnum,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    static create(proto: ProductPrototype, idGen: () => string, stdDate: Date) {
        return new ProducEntity(
            idGen(),
            proto.ItemId,
            proto.name,
            proto.description,
            proto.price,
            proto.coverImage,
            proto.productType,
            stdDate,
            stdDate,
        );
    }
}

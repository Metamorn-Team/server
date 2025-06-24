import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/domain/interface/product.repository';
import {
    convertNumberToItemGrade,
    ItemTypeEnum,
} from 'src/domain/types/item.types';
import {
    convertNumberToProductType,
    Product,
    ProductForPurchase,
    ProductOrderBy,
    ProductTypeEnum,
    Sort,
} from 'src/domain/types/product.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ProductPrismaRepository implements ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByType(
        userId: string,
        type: ProductTypeEnum,
        page: number,
        limit: number,
        orderBy: ProductOrderBy,
        sort: Sort,
    ): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            select: {
                id: true,
                price: true,
                coverImage: true,
                item: {
                    select: {
                        name: true,
                        description: true,
                        itemType: true,
                        key: true,
                        grade: true,
                    },
                },
                purchases: {
                    select: {
                        id: true,
                    },
                    where: {
                        userId,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [orderBy]: sort,
            },
            where: {
                productType: type,
            },
        });

        return products.map((product) => {
            const { item, purchases, id, price, coverImage } = product;

            return {
                id,
                price,
                coverImage,
                description: item.description,
                key: item.key,
                name: item.name,
                type: convertNumberToProductType(item.itemType),
                grade: convertNumberToItemGrade(item.grade),
                purchasedStatus: purchases.length > 0 ? 'PURCHASED' : 'NONE',
            };
        });
    }

    async findByIdsForPurchase(
        ids: string[],
        now = new Date(),
    ): Promise<ProductForPurchase[]> {
        const result = await this.prisma.product.findMany({
            select: {
                id: true,
                price: true,
                itemId: true,
                promotionProducts: {
                    select: {
                        discountRate: true,
                        promotion: {
                            select: {
                                startedAt: true,
                                endedAt: true,
                            },
                        },
                    },
                },
            },
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return result.map((row) => {
            let discountRate = 0;

            if (row.promotionProducts && row.promotionProducts.promotion) {
                const { startedAt, endedAt } = row.promotionProducts.promotion;
                if (startedAt <= now && endedAt > now) {
                    discountRate = row.promotionProducts.discountRate ?? 0;
                }
            }

            return {
                id: row.id,
                itemId: row.itemId,
                originPrice: row.price,
                discountRate,
            };
        });
    }

    async countByType(type: ItemTypeEnum): Promise<number> {
        return await this.prisma.product.count({
            where: {
                item: {
                    itemType: type,
                },
            },
        });
    }
}

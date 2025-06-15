import { Injectable } from '@nestjs/common';
import { PromotionProductRepository } from 'src/domain/interface/promotion-product.repository';
import { convertNumberToItemGrade } from 'src/domain/types/item.types';
import {
    convertNumberToProductType,
    Product,
    ProductOrderBy,
    Sort,
} from 'src/domain/types/product.types';
import { PromotionForCalc } from 'src/domain/types/promotion-product.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PromotionProductPrismaRepository
    implements PromotionProductRepository
{
    constructor(private readonly prisma: PrismaService) {}

    async findByProductIds(productIds: string[]): Promise<PromotionForCalc[]> {
        const result = await this.prisma.promotionProduct.findMany({
            select: {
                discountRate: true,
                productId: true,
                promotion: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            where: {
                productId: {
                    in: productIds,
                },
            },
        });

        return result.map((row) => ({
            promotionId: row.promotion.id,
            promotionName: row.promotion.name,
            productId: row.productId,
            discountRate: row.discountRate,
        }));
    }

    async findByPromotion(
        userId: string,
        name: string,
        page: number,
        limit: number,
        orderBy: ProductOrderBy,
        sort: Sort,
        now = new Date(),
    ): Promise<{ product: Product; promotion: PromotionForCalc }[]> {
        const result = await this.prisma.promotionProduct.findMany({
            select: {
                discountRate: true,
                product: {
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
                            select: { id: true },
                            where: { userId },
                        },
                    },
                },
                promotion: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                product: {
                    [orderBy]: sort,
                },
            },
            where: {
                promotion: {
                    name,
                    startedAt: {
                        lte: now,
                    },
                    endedAt: {
                        gt: now,
                    },
                },
            },
        });

        return result.map((row) => {
            const { discountRate, product: productProto, promotion } = row;
            const { item, purchases, id, price, coverImage } = productProto;

            const product: Product = {
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
            const promotionForCalc: PromotionForCalc = {
                promotionId: promotion.id,
                promotionName: promotion.name,
                productId: product.id,
                discountRate,
            };

            return {
                product,
                promotion: promotionForCalc,
            };
        });
    }

    async countByPromotion(name: string, now = new Date()): Promise<number> {
        return await this.prisma.promotionProduct.count({
            where: {
                promotion: {
                    name,
                    startedAt: {
                        lte: now,
                    },
                    endedAt: {
                        gt: now,
                    },
                },
            },
        });
    }
}

import { Injectable } from '@nestjs/common';
import { PromotionProductRepository } from 'src/domain/interface/promotion-product.repository';
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
}

import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/domain/interface/product.repository';
import { convertNumberToGrade } from 'src/domain/types/item.types';
import {
    Product,
    ProductForPurchase,
    ProductOrderBy,
    Sort,
} from 'src/domain/types/product.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ProductPrismaRepository implements ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByCategory(
        userId: string,
        type: string,
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
                        type: true,
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
                item: {
                    type,
                },
            },
        });

        return products.map((product) => {
            const { item, purchases, ...rest } = product;
            return {
                ...rest,
                ...item,
                grade: convertNumberToGrade(item.grade),
                purchasedStatus: purchases.length > 0 ? 'PURCHASED' : 'NONE',
            };
        });
    }

    async findByIds(ids: string[]): Promise<ProductForPurchase[]> {
        return await this.prisma.product.findMany({
            select: {
                id: true,
                price: true,
                itemId: true,
            },
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    async countByType(type: string): Promise<number> {
        return await this.prisma.product.count({
            where: {
                item: {
                    type,
                },
            },
        });
    }
}

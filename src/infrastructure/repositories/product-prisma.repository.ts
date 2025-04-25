import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/domain/interface/product.repository';
import { Product, ProductOrderBy, Sort } from 'src/domain/types/product.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ProductPrismaRepository implements ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByCategory(
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
            const { item, ...rest } = product;
            return {
                ...rest,
                ...item,
            };
        });
    }

    async countByType(type: string): Promise<number> {
        return await this.prisma.product.count({
            where: {
                type,
            },
        });
    }
}

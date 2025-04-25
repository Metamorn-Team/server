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
        return await this.prisma.product.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                coverImage: true,
                type: true,
                key: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [orderBy]: sort,
            },
            where: {
                type,
            },
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

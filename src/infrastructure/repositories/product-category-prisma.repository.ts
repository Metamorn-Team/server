import { Injectable } from '@nestjs/common';
import { ProductCategoryRepository } from 'src/domain/interface/product-category.repository';
import { ProductCategory } from 'src/domain/types/product-category';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ProductCategoryPrismaRepository
    implements ProductCategoryRepository
{
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<ProductCategory[]> {
        return await this.prisma.productCategory.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
}

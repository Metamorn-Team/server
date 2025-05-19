import { Module } from '@nestjs/common';
import { ProductReader } from 'src/domain/components/products/product-reader';
import { ProductRepository } from 'src/domain/interface/product.repository';
import { ProductPrismaRepository } from 'src/infrastructure/repositories/product-prisma.repository';

@Module({
    providers: [
        ProductReader,
        { provide: ProductRepository, useClass: ProductPrismaRepository },
    ],
    exports: [ProductReader],
})
export class ProductComponentModule {}

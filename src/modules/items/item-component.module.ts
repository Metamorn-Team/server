import { Module } from '@nestjs/common';
import { ItemReader } from 'src/domain/components/items/item-reader';
import { ItemRepository } from 'src/domain/interface/item.repository';
import { ItemPrismaRepository } from 'src/infrastructure/repositories/item-prisma.repository';

@Module({
    providers: [
        ItemReader,
        { provide: ItemRepository, useClass: ItemPrismaRepository },
    ],
    exports: [ItemReader],
})
export class ItemComponentModule {}

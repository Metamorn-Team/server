import { Module } from '@nestjs/common';
import { UserOwnedItemWriter } from 'src/domain/components/user-owned-items/user-owned-item-writer';
import { UserOwnedItemRepository } from 'src/domain/interface/user-owned-item.repository';
import { UserOwnedItemPrismaRepository } from 'src/infrastructure/repositories/user-owned-item-prisma.repository';

@Module({
    providers: [
        UserOwnedItemWriter,
        {
            provide: UserOwnedItemRepository,
            useClass: UserOwnedItemPrismaRepository,
        },
    ],
    exports: [UserOwnedItemWriter],
})
export class UserOwnedItemComponentModule {}

import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { UserOwnedItemEntity } from 'src/domain/entities/user-owned-items/user-owned-item.entity';
import { UserOwnedItemRepository } from 'src/domain/interface/user-owned-item.repository';

@Injectable()
export class UserOwnedItemPrismaRepository implements UserOwnedItemRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async save(data: UserOwnedItemEntity): Promise<void> {
        await this.txHost.tx.userOwnedItem.create({ data });
    }

    async saveMany(data: UserOwnedItemEntity[]): Promise<void> {
        await this.txHost.tx.userOwnedItem.createMany({ data });
    }
}

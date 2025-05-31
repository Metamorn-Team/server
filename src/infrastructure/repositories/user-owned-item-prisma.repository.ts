import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { UserOwnedItemEntity } from 'src/domain/entities/user-owned-items/user-owned-item.entity';
import { UserOwnedItemRepository } from 'src/domain/interface/user-owned-item.repository';
import {
    ItemTypeEnum,
    ItemGradeEnum,
    Item,
    convertNumberToItemGrade,
    convertNumberToItemType,
} from 'src/domain/types/item.types';

@Injectable()
export class UserOwnedItemPrismaRepository implements UserOwnedItemRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async findAllByTypeAndGrade(
        userId: string,
        itemType: ItemTypeEnum,
        grade: ItemGradeEnum,
    ): Promise<Item[]> {
        const result = await this.txHost.tx.userOwnedItem.findMany({
            select: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        itemType: true,
                        key: true,
                        grade: true,
                    },
                },
            },
            where: {
                userId,
                item: {
                    grade,
                    itemType,
                },
            },
            orderBy: {
                item: {
                    name: 'asc',
                },
            },
        });

        return result.map((item) => {
            const { itemType, grade, ...itemData } = item.item;
            return {
                ...itemData,
                type: convertNumberToItemType(itemType),
                grade: convertNumberToItemGrade(grade),
            };
        });
    }

    async save(data: UserOwnedItemEntity): Promise<void> {
        await this.txHost.tx.userOwnedItem.create({ data });
    }

    async saveMany(data: UserOwnedItemEntity[]): Promise<void> {
        await this.txHost.tx.userOwnedItem.createMany({ data });
    }
}

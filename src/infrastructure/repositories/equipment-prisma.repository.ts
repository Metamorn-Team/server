import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EquipmentEntity } from 'src/domain/entities/equipments/equipment.entity';
import { EquipmentRepository } from 'src/domain/interface/equipment.repository';
import {
    convertNumberToSlotType,
    Equipped,
    SlotTypeEnum,
} from 'src/domain/types/equipment.types';

@Injectable()
export class EquipmentPrismaRepository implements EquipmentRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async save(data: EquipmentEntity): Promise<void> {
        await this.txHost.tx.equipment.create({ data });
    }

    async upsert(data: EquipmentEntity): Promise<void> {
        await this.txHost.tx.equipment.upsert({
            where: {
                userId_slot: {
                    userId: data.userId,
                    slot: data.slot,
                },
            },
            update: {
                itemId: data.itemId,
                updatedAt: data.updatedAt,
            },
            create: {
                ...data,
            },
        });
    }

    async update(
        userId: string,
        slot: SlotTypeEnum,
        data: Partial<Omit<EquipmentEntity, 'userId' | 'slot'>>,
    ): Promise<void> {
        const { itemId, updatedAt } = data;

        await this.txHost.tx.equipment.update({
            data: {
                itemId,
                updatedAt: updatedAt || new Date(),
            },
            where: {
                userId_slot: {
                    userId,
                    slot,
                },
            },
        });
    }

    async existBySlot(userId: string, slot: SlotTypeEnum): Promise<boolean> {
        const result = await this.txHost.tx.equipment.findUnique({
            select: { userId: true },
            where: {
                userId_slot: {
                    userId,
                    slot,
                },
            },
        });

        return !!result;
    }

    async findEquippedForEquip(userId: string): Promise<Equipped[]> {
        const result = await this.txHost.tx.equipment.findMany({
            select: { slot: true, item: { select: { key: true, name: true } } },
            where: { userId },
        });

        return result.map((equipped) => ({
            slot: convertNumberToSlotType(equipped.slot),
            key: equipped.item.key,
            name: equipped.item.name,
        }));
    }

    async findEquippedByUserIds(
        userIds: string[],
    ): Promise<Record<string, Equipped[]>> {
        const result = await this.txHost.tx.equipment.findMany({
            where: { userId: { in: userIds } },
            select: {
                userId: true,
                slot: true,
                item: { select: { key: true, name: true } },
            },
        });

        const map: Record<string, Equipped[]> = {};
        for (const id of userIds) {
            map[id] = [];
        }

        for (const row of result) {
            map[row.userId].push({
                slot: convertNumberToSlotType(row.slot),
                key: row.item.key,
                name: row.item.name,
            });
        }

        return map;
    }
}

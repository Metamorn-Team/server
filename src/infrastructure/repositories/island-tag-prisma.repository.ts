import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { IslandTagEntity } from 'src/domain/entities/tag/island-tag.entity';
import { IslandTagRepository } from 'src/domain/interface/island-tag.repository';

@Injectable()
export class IslandTagPrismaRepository implements IslandTagRepository {
    constructor(
        private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    ) {}

    async saveMany(data: IslandTagEntity[]): Promise<void> {
        await this.txHost.tx.islandTag.createMany({ data });
    }
}

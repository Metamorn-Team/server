import { Transactional } from '@nestjs-cls/transactional';
import { HttpStatus, Injectable } from '@nestjs/common';
import { IslandReader } from 'src/domain/components/islands/island-reader';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { NormalIslandStorageWriter } from 'src/domain/components/islands/normal-storage/normal-island-storage-writer';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { FORBIDDEN_MESSAGE } from 'src/domain/exceptions/message';
import { NormalIslandUpdateInput } from 'src/domain/types/island.types';

@Injectable()
export class IslandService {
    constructor(
        private readonly islandReader: IslandReader,
        private readonly islandWriter: IslandWriter,
        private readonly normalIslandStorageWriter: NormalIslandStorageWriter,
    ) {}

    async update(id: string, userId: string, input: NormalIslandUpdateInput) {
        const island = await this.islandReader.readSummary(id);
        if (island.ownerId !== userId) {
            throw new DomainException(
                DomainExceptionType.FORBIDDEN,
                HttpStatus.FORBIDDEN,
                FORBIDDEN_MESSAGE,
            );
        }

        await this.updateTrnsaction(id, input);
    }

    @Transactional()
    async updateTrnsaction(
        id: string,
        input: NormalIslandUpdateInput,
    ): Promise<void> {
        await this.islandWriter.update(id, input);
        await this.normalIslandStorageWriter.update(id, input);
    }
}

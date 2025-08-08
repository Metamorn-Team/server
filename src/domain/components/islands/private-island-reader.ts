import { Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { PrivateIslandRepository } from 'src/domain/interface/private-island.repository';
import { GetPaginatedMyIslandsInput } from 'src/domain/types/private-island.types';

@Injectable()
export class PrivateIslandReader {
    constructor(
        @Inject(PrivateIslandRepository)
        private readonly privateIslandRepository: PrivateIslandRepository,
    ) {}

    async existByUrlPath(urlPath: string): Promise<boolean> {
        return this.privateIslandRepository.existByUrlPath(urlPath);
    }

    async readMyIslands(input: GetPaginatedMyIslandsInput) {
        return await this.privateIslandRepository.findPaginatedMine(input);
    }

    async countByOwner(ownerId: string): Promise<number> {
        return await this.privateIslandRepository.countByOwner(ownerId);
    }

    async readIdByUrlPath(urlPath: string): Promise<{ id: string }> {
        const id = await this.privateIslandRepository.findIdByUrlPath(urlPath);
        if (!id) {
            throw new DomainException(
                DomainExceptionType.ISLAND_NOT_FOUND,
                ISLAND_NOT_FOUND_MESSAGE,
            );
        }

        return id;
    }
}

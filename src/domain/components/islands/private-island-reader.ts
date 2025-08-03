import { Inject, Injectable } from '@nestjs/common';
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
}

import { Inject, Injectable } from '@nestjs/common';
import { PrivateIslandRepository } from 'src/domain/interface/private-island.repository';

@Injectable()
export class PrivateIslandReader {
    constructor(
        @Inject(PrivateIslandRepository)
        private readonly privateIslandRepository: PrivateIslandRepository,
    ) {}

    async existByUrlPath(urlPath: string): Promise<boolean> {
        return this.privateIslandRepository.existByUrlPath(urlPath);
    }
}

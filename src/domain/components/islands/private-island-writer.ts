import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import {
    PrivateIslandEntity,
    PrivateIslandPrototype,
} from 'src/domain/entities/islands/private-island.entity';
import { PrivateIslandRepository } from 'src/domain/interface/private-island.repository';

@Injectable()
export class PrivateIslandWriter {
    constructor(
        @Inject(PrivateIslandRepository)
        private readonly privateIslandRepository: PrivateIslandRepository,
    ) {}

    async create(
        prototype: PrivateIslandPrototype,
    ): Promise<PrivateIslandEntity> {
        const island = PrivateIslandEntity.create(
            {
                ...prototype,
            },
            v4,
        );
        await this.privateIslandRepository.create(island);

        return island;
    }

    async delete(id: string, now = new Date()) {
        await this.privateIslandRepository.delete(id, now);
    }
}

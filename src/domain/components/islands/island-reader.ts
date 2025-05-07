import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { Island } from 'src/domain/types/game.types';

@Injectable()
export class IslandReader {
    constructor(
        @Inject(IslandRepository)
        private readonly islandRepository: IslandRepository,
    ) {}

    async readOne(id: string): Promise<Island> {
        const island = await this.islandRepository.findOneById(id);
        if (!island) {
            throw new DomainException(
                DomainExceptionType.ISLAND_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                ISLAND_NOT_FOUND_MESSAGE,
            );
        }

        return island;
    }
}

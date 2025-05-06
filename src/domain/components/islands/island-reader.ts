import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { IslandRepository } from 'src/domain/interface/island.repository';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { Island } from 'src/domain/types/game.types';

@Injectable()
export class IslandReader {
    constructor(
        @Inject(IslandRepository)
        private readonly islandRepository: IslandRepository,
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
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

    readLiveIsland(page: number, limit = 20) {
        const islands = this.normalIslandStorage.getAllIsland();

        islands.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const start = (page - 1) * limit;
        const end = start + limit;

        return islands.slice(start, end).map((island) => ({
            id: island.id,
            maxMembers: island.max,
            countParticipants: island.players.size,
            name: island.name,
            description: island.description,
            coverImage: island.coverImage,
            tags: island.tags,
        }));
    }
}

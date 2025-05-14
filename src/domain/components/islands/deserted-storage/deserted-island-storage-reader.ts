import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { ISLAND_NOT_FOUND_MESSAGE } from 'src/domain/exceptions/message';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';

@Injectable()
export class DesertedIslandStorageReader {
    constructor(
        @Inject(DesertedIslandStorage)
        private readonly desertedIslandStorage: DesertedIslandStorage,
    ) {}

    async readAll() {
        return await this.desertedIslandStorage.getAllIsland();
    }

    async readOne(id: string) {
        const island = await this.desertedIslandStorage.getIsland(id);
        if (!island)
            throw new DomainException(
                DomainExceptionType.ISLAND_NOT_FOUND_IN_STORAGE,
                HttpStatus.NOT_FOUND,
                ISLAND_NOT_FOUND_MESSAGE,
            );

        return island;
    }

    async getAllPlayer(islandId: string) {
        return await this.desertedIslandStorage.getPlayerIdsByIslandId(
            islandId,
        );
    }

    async countPlayer(id: string) {
        return await this.desertedIslandStorage.countPlayer(id);
    }

    // logging
    // getStore() {
    //     return this.desertedIslandStorage.getIslandStore();
    // }
}

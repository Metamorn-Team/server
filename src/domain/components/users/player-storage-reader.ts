import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Injectable()
export class PlayerStorageReader {
    constructor(
        @Inject(PlayerStorage)
        private readonly playerStorage: PlayerStorage,
        private readonly playerMemoryStorage: PlayerMemoryStorage,
    ) {}

    async readOne(id: string) {
        const memoryPlayer = this.playerMemoryStorage.getPlayer(id);
        if (memoryPlayer) return memoryPlayer;

        const player = await this.playerStorage.getPlayer(id);
        if (!player)
            throw new DomainException(
                DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                HttpStatus.NOT_FOUND,
                PLAYER_NOT_FOUND_IN_STORAGE,
            );

        this.playerMemoryStorage.addPlayer(player);

        return player;
    }

    async readOneByClientId(clientId: string) {
        const memoryPlayer =
            this.playerMemoryStorage.getPlayerByClientId(clientId);
        if (memoryPlayer) return memoryPlayer;

        const player = await this.playerStorage.getPlayerByClientId(clientId);
        if (!player)
            throw new DomainException(
                DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                HttpStatus.NOT_FOUND,
                PLAYER_NOT_FOUND_IN_STORAGE,
            );

        this.playerMemoryStorage.addPlayer(player);

        return player;
    }

    // getStore() {
    //     return this.playerStorage.getPlayerStore();
    // }
}

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { Player } from 'src/domain/models/game/player';
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

    async readMany(ids: string[]): Promise<Player[]> {
        const players: Player[] = [];
        const idToFetch: string[] = [];

        ids.forEach((id) => {
            const player = this.playerMemoryStorage.getPlayer(id);

            if (player) {
                players.push(player);
            } else {
                idToFetch.push(id);
            }
        });

        if (idToFetch.length === 0) return players;

        const fetchedPlayers = await this.playerStorage.getPlayers(idToFetch);
        fetchedPlayers.forEach((player) =>
            this.playerMemoryStorage.addPlayer(player),
        );

        return [...players, ...fetchedPlayers];
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

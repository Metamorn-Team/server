import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { PLAYER_NOT_FOUND_IN_STORAGE } from 'src/domain/exceptions/message';
import { Player } from 'src/domain/models/game/player';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Injectable()
export class PlayerMemoryStorageManager {
    constructor(private readonly playerMemoryStorage: PlayerMemoryStorage) {}

    readOne(id: string) {
        const player = this.playerMemoryStorage.getPlayer(id);
        if (!player) {
            throw new DomainException(
                DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                HttpStatus.NOT_FOUND,
                PLAYER_NOT_FOUND_IN_STORAGE,
            );
        }
        return player;
    }

    readMany(ids: string[]): Player[] {
        const players: Player[] = [];
        for (const id of ids) {
            const player = this.playerMemoryStorage.getPlayer(id);
            if (player) {
                players.push(player);
            }
        }
        return players;
    }

    readOneByClientId(clientId: string) {
        const player = this.playerMemoryStorage.getPlayerByClientId(clientId);
        if (!player) {
            throw new DomainException(
                DomainExceptionType.PLAYER_NOT_FOUND_IN_STORAGE,
                HttpStatus.NOT_FOUND,
                PLAYER_NOT_FOUND_IN_STORAGE,
            );
        }
        return player;
    }

    remove(id: string) {
        this.playerMemoryStorage.deletePlayer(id);
    }

    updateLastActivity(id: string, time = Date.now()) {
        this.playerMemoryStorage.updateLastActivity(id, time);
    }
}

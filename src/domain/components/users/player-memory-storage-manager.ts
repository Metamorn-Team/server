import { Injectable } from '@nestjs/common';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Injectable()
export class PlayerMemoryStorageManager {
    constructor(private readonly playerMemoryStorage: PlayerMemoryStorage) {}

    readOne(id: string) {
        return this.playerMemoryStorage.getPlayer(id);
    }

    readOneByClientId(clientId: string) {
        return this.playerMemoryStorage.getPlayerByClientId(clientId);
    }
}

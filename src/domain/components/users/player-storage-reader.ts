import { Inject, Injectable } from '@nestjs/common';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';

@Injectable()
export class PlayerStorageReader {
    constructor(
        @Inject(PlayerStorage)
        private readonly playerStorage: PlayerStorage,
    ) {}

    readOne(id: string) {
        return this.playerStorage.getPlayer(id);
    }

    readOneByClientId(clientId: string) {
        return this.playerStorage.getPlayerByClientId(clientId);
    }

    getStore() {
        return this.playerStorage.getPlayerStore();
    }
}

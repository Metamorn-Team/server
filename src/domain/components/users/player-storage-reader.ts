import { Inject, Injectable } from '@nestjs/common';
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
        try {
            return this.playerMemoryStorage.getPlayer(id);
        } catch (_) {
            const player = await this.playerStorage.getPlayer(id);
            this.playerMemoryStorage.addPlayer(player.id, player);

            return player;
        }
    }

    async readOneByClientId(clientId: string) {
        try {
            return await this.playerStorage.getPlayerByClientId(clientId);
        } catch (_) {
            const player =
                await this.playerStorage.getPlayerByClientId(clientId);
            this.playerMemoryStorage.addPlayer(player.id, player);

            return player;
        }
    }

    // getStore() {
    //     return this.playerStorage.getPlayerStore();
    // }
}

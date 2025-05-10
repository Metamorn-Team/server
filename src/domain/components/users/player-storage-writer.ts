import { Inject, Injectable } from '@nestjs/common';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { Player } from 'src/domain/models/game/player';
import { PlayerMemoryStorage } from 'src/infrastructure/storages/player-memory-storage';

@Injectable()
export class PlayerStorageWriter {
    constructor(
        @Inject(PlayerStorage)
        private readonly playerStorage: PlayerStorage,
        private readonly playerMemoryStorage: PlayerMemoryStorage,
    ) {}

    async create(player: Player) {
        await this.playerStorage.addPlayer(player.id, player);
        this.playerMemoryStorage.addPlayer(player);
    }

    async remove(id: string) {
        await this.playerStorage.deletePlayer(id);
        this.playerMemoryStorage.deletePlayer(id);
    }
}

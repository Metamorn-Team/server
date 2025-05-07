import { Inject, Injectable } from '@nestjs/common';
import { PlayerStorage } from 'src/domain/interface/storages/player-storage';
import { Player } from 'src/domain/models/game/player';

@Injectable()
export class PlayerStorageWriter {
    constructor(
        @Inject(PlayerStorage)
        private readonly playerStorage: PlayerStorage,
    ) {}

    create(player: Player) {
        this.playerStorage.addPlayer(player.id, player);
    }

    remove(id: string) {
        this.playerStorage.deletePlayer(id);
    }
}

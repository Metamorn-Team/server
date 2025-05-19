import { Injectable } from '@nestjs/common';
import { MOVING_THRESHOLD } from 'src/constants/threshold';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';
import { PlayerStorageWriter } from 'src/domain/components/users/player-storage-writer';
import { Player } from 'src/domain/models/game/player';

@Injectable()
export class GamePlayerManager {
    constructor(
        private readonly playerMemoryStorageManager: PlayerMemoryStorageManager,
        private readonly playerStorageWriter: PlayerStorageWriter,
    ) {}

    canMove(player: Player, x: number, y: number, now = Date.now()) {
        return player.lastMoved + MOVING_THRESHOLD > now ||
            (player.x === x && player.y === y)
            ? false
            : true;
    }

    changePosition(player: Player, x: number, y: number) {
        player.isFacingRight =
            player.x < x ? true : player.x > x ? false : player.isFacingRight;

        player.x = x;
        player.y = y;
    }

    // TODO 이건 매번 검증 안 하고 따로 테스트하면 될듯
    async updateLastActivity(player: Player, now = Date.now()) {
        if (player.lastActivity + 1000 * 20 < now) {
            this.playerMemoryStorageManager.updateLastActivity(player.id);
        }
        if (player.lastActivity + 1000 * 60 * 3 < now) {
            await this.playerStorageWriter.updateLastActivity(player.id);
        }
    }
}

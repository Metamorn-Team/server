import { Inject, Injectable, Logger } from '@nestjs/common';
import { PlayerStorage } from 'src/domain/interface/storages/game-storage';
import { ATTACK_BOX_SIZE } from 'src/constants/game/attack-box';
import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { MOVING_THRESHOLD } from 'src/constants/threshold';
import { Player } from 'src/domain/models/game/player';
import { DesertedIslandStorage } from 'src/domain/interface/storages/deserted-island-storage';
import { NormalIslandStorage } from 'src/domain/interface/storages/normal-island-storage';
import { IslandTypeEnum } from 'src/domain/types/island.types';

@Injectable()
export class GameService {
    constructor(
        @Inject(PlayerStorage)
        private readonly gameStorage: PlayerStorage,
        @Inject(DesertedIslandStorage)
        private readonly desertedIslandStorage: DesertedIslandStorage,
        @Inject(NormalIslandStorage)
        private readonly normalIslandStorage: NormalIslandStorage,
    ) {}

    getPlayer(playerId: string) {
        return this.gameStorage.getPlayer(playerId);
    }

    getPlayerByClientId(clientId: string) {
        return this.gameStorage.getPlayerByClientId(clientId);
    }

    move(playerId: string, x: number, y: number): Player | null {
        const player = this.gameStorage.getPlayer(playerId);

        if (!player) return null;
        if (player.lastMoved + MOVING_THRESHOLD > Date.now()) return null;
        if (player.x === x && player.y === y) return null;

        player.isFacingRight =
            player.x < x ? true : player.x > x ? false : player.isFacingRight;

        player.setPosition(x, y);
        return player;
    }

    attack(attackerId: string) {
        const attacker = this.gameStorage.getPlayer(attackerId);
        if (!attacker) throw new Error('없는 회원');

        const island =
            attacker.islandType === IslandTypeEnum.NORMAL
                ? this.normalIslandStorage.getIsland(attacker.roomId)
                : this.desertedIslandStorage.getIsland(attacker.roomId);
        if (!island) throw new Error('없는 섬');

        if (island.players.size === 0) {
            return {
                attacker,
                attackedPlayers: [],
            };
        }

        // 아바타 추가되면 avatarKey에 따라 분기
        const boxSize = ATTACK_BOX_SIZE.PAWN;
        const attackBox = {
            x: attacker.isFacingRight
                ? attacker.x + boxSize.width / 2
                : attacker.x - boxSize.width / 2,
            y: attacker.y,
            width: boxSize.width,
            height: boxSize.height,
        };

        const attackedPlayers = Array.from(island.players)
            .map((playerId) => this.getPlayer(playerId))
            .filter((player) => player !== null)
            .filter((player) => player.id !== attacker.id)
            .filter((player) => this.isInAttackBox(player, attackBox));
        attacker.updateLastActivity();

        return {
            attacker,
            attackedPlayers,
        };
    }

    isInAttackBox(
        player: Player,
        box: { x: number; y: number; width: number; height: number },
    ) {
        // 캐릭터 추가되면 상수로 관리
        const playerRadius = PLAYER_HIT_BOX.PAWN.RADIUS;

        const boxLeft = box.x - box.width / 2;
        const boxRight = box.x + box.width / 2;
        const boxTop = box.y - box.height / 2;
        const boxBottom = box.y + box.height / 2;

        if (
            player.x >= boxLeft &&
            player.x <= boxRight &&
            player.y >= boxTop &&
            player.y <= boxBottom
        ) {
            return true;
        }

        const closestX = Math.max(boxLeft, Math.min(player.x, boxRight));
        const closestY = Math.max(boxTop, Math.min(player.y, boxBottom));

        const distanceX = player.x - closestX;
        const distanceY = player.y - closestY;

        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        return distanceSquared < playerRadius * playerRadius;
    }

    hearbeatFromIsland(
        playerId: string,
    ): { id: string; lastActivity: number }[] {
        const player = this.gameStorage.getPlayer(playerId);
        if (!player) throw new Error('플레이어 없음');

        const playerIds =
            player.islandType === IslandTypeEnum.NORMAL
                ? this.normalIslandStorage.getPlayerIdsByIslandId(player.roomId)
                : this.desertedIslandStorage.getPlayerIdsByIslandId(
                      player.roomId,
                  );
        const players = playerIds
            .map((playerId) => {
                const player = this.gameStorage.getPlayer(playerId);
                if (player) {
                    return {
                        id: player.id,
                        lastActivity: player.lastActivity,
                    };
                }
            })
            .filter((player) => !!player);

        return players.map((player) => ({
            id: player.id,
            lastActivity: player.lastActivity,
        }));
    }

    loggingStore(logger: Logger) {
        logger.debug('전체 회원', this.gameStorage.getPlayerStore());
        logger.debug('전체 방', this.desertedIslandStorage.getIslandStore());
    }
}

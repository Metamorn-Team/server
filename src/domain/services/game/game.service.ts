import { Injectable } from '@nestjs/common';
import { ATTACK_BOX_SIZE } from 'src/constants/game/attack-box';
import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { MOVING_THRESHOLD } from 'src/constants/threshold';
import { Player } from 'src/domain/models/game/player';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';

@Injectable()
export class GameService {
    constructor(
        private readonly playerMemoryStorageManager: PlayerMemoryStorageManager,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
    ) {}

    getPlayerByClientId(clientId: string) {
        return this.playerMemoryStorageManager.readOneByClientId(clientId);
    }

    move(playerId: string, x: number, y: number): Player | null {
        const player = this.playerMemoryStorageManager.readOne(playerId);

        const now = Date.now();
        if (
            player.lastMoved + MOVING_THRESHOLD > now ||
            (player.x === x && player.y === y)
        )
            return null;

        if (player.lastActivity + 60000 < now) {
            this.playerMemoryStorageManager.updateLastActivity(playerId);
        }

        player.isFacingRight =
            player.x < x ? true : player.x > x ? false : player.isFacingRight;

        player.x = x;
        player.y = y;

        return player;
    }

    async attack(attackerId: string) {
        const attacker = this.playerMemoryStorageManager.readOne(attackerId);
        if (!attacker) throw new Error('없는 회원');

        const island =
            attacker.islandType === IslandTypeEnum.NORMAL
                ? await this.normalIslandStorageReader.readOne(attacker.roomId)
                : await this.desertedIslandStorageReader.readOne(
                      attacker.roomId,
                  );
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
            .map((playerId) =>
                this.playerMemoryStorageManager.readOne(playerId),
            )
            .filter((player) => player !== null)
            .filter((player) => player.id !== attacker.id)
            .filter((player) => this.isInAttackBox(player, attackBox));
        attacker.lastActivity = Date.now();

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

    async hearbeatFromIsland(
        playerId: string,
    ): Promise<{ id: string; lastActivity: number }[]> {
        const player = this.playerMemoryStorageManager.readOne(playerId);

        const playerIds =
            player.islandType === IslandTypeEnum.NORMAL
                ? await this.normalIslandStorageReader.getAllPlayer(
                      player.roomId,
                  )
                : await this.desertedIslandStorageReader.getAllPlayer(
                      player.roomId,
                  );

        const players = playerIds
            .map((playerId) => {
                const player =
                    this.playerMemoryStorageManager.readOne(playerId);
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
}

import { Injectable } from '@nestjs/common';
import { ATTACK_BOX_SIZE } from 'src/constants/game/attack-box';
import { PLAYER_HIT_BOX } from 'src/constants/game/hit-box';
import { Player } from 'src/domain/models/game/player';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';
import { GamePlayerManager } from 'src/domain/components/game/game-player-manager';
import { Position, Rectangle } from 'src/domain/types/game.types';
import { isCircleInRect } from 'src/utils/game/collision';

@Injectable()
export class GameService {
    constructor(
        private readonly gamePlayerManager: GamePlayerManager,
        private readonly playerMemoryStorageManager: PlayerMemoryStorageManager,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
    ) {}

    getPlayerByClientId(clientId: string) {
        return this.playerMemoryStorageManager.readOneByClientId(clientId);
    }

    async move(playerId: string, x: number, y: number): Promise<Player | null> {
        const player = this.playerMemoryStorageManager.readOne(playerId);

        const now = Date.now();
        const canMove = this.gamePlayerManager.canMove(player, x, y);
        if (!canMove) return null;

        await this.gamePlayerManager.updateLastActivity(player, now);
        this.gamePlayerManager.changePosition(player, x, y);

        return player;
    }

    async attack(attackerId: string) {
        const attacker = this.playerMemoryStorageManager.readOne(attackerId);
        const { roomId: islandId, islandType } = attacker;

        const island =
            islandType === IslandTypeEnum.NORMAL
                ? await this.normalIslandStorageReader.readOne(islandId)
                : await this.desertedIslandStorageReader.readOne(islandId);

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

    isInAttackBox(targetPosition: Position, box: Rectangle) {
        // TODO 캐릭터 추가되면 상수로 관리
        const radius = PLAYER_HIT_BOX.PAWN.RADIUS;
        const isHit = isCircleInRect({ ...targetPosition, radius }, box);

        return isHit;
    }

    async hearbeatFromIsland(
        playerId: string,
    ): Promise<{ id: string; lastActivity: number }[]> {
        const player = this.playerMemoryStorageManager.readOne(playerId);
        const { islandType, roomId: islandId } = player;

        const playerIds =
            islandType === IslandTypeEnum.NORMAL
                ? await this.normalIslandStorageReader.getAllPlayer(islandId)
                : await this.desertedIslandStorageReader.getAllPlayer(islandId);

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

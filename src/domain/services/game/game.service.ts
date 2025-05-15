import { Injectable } from '@nestjs/common';
import { Player } from 'src/domain/models/game/player';
import { IslandTypeEnum } from 'src/domain/types/island.types';
import { NormalIslandStorageReader } from 'src/domain/components/islands/normal-storage/normal-island-storage-reader';
import { DesertedIslandStorageReader } from 'src/domain/components/islands/deserted-storage/deserted-island-storage-reader';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';
import { GamePlayerManager } from 'src/domain/components/game/game-player-manager';
import { GameAttackManager } from 'src/domain/components/game/game-attack-manager';
import { LiveIsland } from 'src/domain/types/game.types';

@Injectable()
export class GameService {
    constructor(
        private readonly gamePlayerManager: GamePlayerManager,
        private readonly gameAttackManager: GameAttackManager,
        private readonly playerMemoryStorageManager: PlayerMemoryStorageManager,
        private readonly normalIslandStorageReader: NormalIslandStorageReader,
        private readonly desertedIslandStorageReader: DesertedIslandStorageReader,
    ) {}

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

        if (this.isIslandEmpty(island)) {
            return { attacker, attackedPlayers: [] };
        }

        const attackBox = this.gameAttackManager.calcAttackRangeBox(attacker);
        const attackedPlayers = this.gameAttackManager.findTargetsInBox(
            Array.from(island.players),
            attackerId,
            attackBox,
        );
        await this.gamePlayerManager.updateLastActivity(attacker);

        return {
            attacker,
            attackedPlayers,
        };
    }

    private isIslandEmpty(island: LiveIsland): boolean {
        return island.players.size === 0;
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

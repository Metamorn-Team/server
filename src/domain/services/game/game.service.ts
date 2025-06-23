import { Injectable } from '@nestjs/common';
import { Player } from 'src/domain/models/game/player';
import { PlayerMemoryStorageManager } from 'src/domain/components/users/player-memory-storage-manager';
import { GamePlayerManager } from 'src/domain/components/game/game-player-manager';
import { GameAttackManager } from 'src/domain/components/game/game-attack-manager';
import { LiveIsland } from 'src/domain/types/game.types';
import { IslandStorageReaderFactory } from 'src/domain/components/islands/factory/island-storage-reader-factory';
import { IslandActiveObjectReader } from 'src/domain/components/island-spawn-object/island-active-object-reader';

@Injectable()
export class GameService {
    constructor(
        private readonly gamePlayerManager: GamePlayerManager,
        private readonly gameAttackManager: GameAttackManager,
        private readonly playerMemoryStorageManager: PlayerMemoryStorageManager,
        private readonly islandStorageReaderFactory: IslandStorageReaderFactory,
        private readonly islandActiveObjectReader: IslandActiveObjectReader,
    ) {}

    async move(
        playerId: string,
        x: number,
        y: number,
        now = Date.now(),
    ): Promise<Player | null> {
        const player = this.playerMemoryStorageManager.readOne(playerId);

        const canMove = this.gamePlayerManager.canMove(player, x, y, now);
        if (!canMove) return null;

        await this.gamePlayerManager.updateLastActivity(player, now);
        this.gamePlayerManager.changePosition(player, x, y);

        return player;
    }

    async attackPlayer(attackerId: string) {
        const attacker = this.playerMemoryStorageManager.readOne(attackerId);
        const { roomId: islandId, islandType } = attacker;

        const reader = this.islandStorageReaderFactory.get(islandType);
        const island = await reader.readOne(islandId);

        if (this.isIslandEmpty(island)) {
            return { attacker, attackedPlayers: [] };
        }

        const players = this.playerMemoryStorageManager.readMany(
            Array.from(island.players),
        );

        const attackedPlayers = this.gameAttackManager.findCollidingObjects(
            attackerId,
            attacker.getAttackBox(),
            players.map((player) => ({
                id: player.id,
                hitBox: player.getHitBox(),
            })),
        );
        await this.gamePlayerManager.updateLastActivity(attacker);

        return {
            attacker,
            attackedPlayers,
        };
    }

    async attackObject(attackerId: string) {
        const attacker = this.playerMemoryStorageManager.readOne(attackerId);
        const { roomId: islandId, islandType } = attacker;

        const reader = this.islandStorageReaderFactory.get(islandType);
        const island = await reader.readOne(islandId);

        if (this.isIslandEmpty(island)) {
            return { attacker, attackedPlayers: [] };
        }

        const objects = this.islandActiveObjectReader.readAll(islandId);

        const attackedPlayers = this.gameAttackManager.findCollidingObjects(
            attackerId,
            attacker.getAttackBox(),
            objects.map((object) => ({
                id: object.id,
                hitBox: object.getHitBox(),
            })),
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

        const reader = this.islandStorageReaderFactory.get(islandType);
        const playerIds = await reader.getAllPlayer(islandId);

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

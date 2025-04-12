import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { GameStorage } from 'src/domain/interface/storages/game-storage';
import { Player, IslandTag, SocketClientId } from 'src/domain/types/game.types';
import { IslandWriter } from 'src/domain/components/islands/island-writer';
import { IslandEntity } from 'src/domain/entities/islands/island.entity';
import { IslandJoinWriter } from 'src/domain/components/island-join/island-join-writer';
import { IslandJoinEntity } from 'src/domain/entities/island-join/island-join.entity';
import { ATTACK_BOX_SIZE } from 'src/constants/game';

@Injectable()
export class ZoneService {
    constructor(
        @Inject(GameStorage)
        private readonly gameStorage: GameStorage,
        private readonly islandWriter: IslandWriter,
        private readonly islandJoinWriter: IslandJoinWriter,
    ) {}

    async createRoom(tag: IslandTag) {
        const stdDate = new Date();
        const island = IslandEntity.create({ tag }, v4, stdDate);
        await this.islandWriter.create(island);

        const { id } = island;

        const room = {
            id,
            max: 5,
            players: new Set<SocketClientId>(),
            type: tag,
        };
        this.gameStorage.createIsland(id, room);
        const roomOfTags = this.gameStorage.getIslandOfTag(tag);

        if (roomOfTags) {
            roomOfTags.add(id);
        } else {
            this.gameStorage.addIslandOfTag(tag, id);
        }

        return room;
    }

    async getAvailableRoom(tag: IslandTag) {
        const roomIds = this.gameStorage.getIslandIdsByTag(tag);

        if (roomIds) {
            for (const roomId of roomIds) {
                const room = this.gameStorage.getIsland(roomId);

                if (room && room.players.size < room.max) {
                    return room;
                }
            }
        }

        return await this.createRoom(tag);
    }

    getIsland(islandId: string) {
        return this.gameStorage.getIsland(islandId);
    }

    async joinRoom(islandId: string, playerId: string, player: Player) {
        const stdDate = new Date();
        const islandJoin = IslandJoinEntity.create(
            { islandId, userId: player.id },
            v4,
            stdDate,
        );
        await this.islandJoinWriter.create(islandJoin);

        this.gameStorage.addPlayer(playerId, player);

        const room = this.gameStorage.getIsland(islandId);
        if (!room) throw new Error('없는 방');

        room.players.add(playerId);
    }

    async leaveRoom(islandId: string, playerId: string) {
        const player = this.gameStorage.getPlayer(playerId);
        if (!player) return;

        this.gameStorage.deletePlayer(playerId);

        const room = this.gameStorage.getIsland(islandId);
        if (!room) return;

        await this.islandJoinWriter.left(islandId, player.id);

        room.players.delete(playerId);

        return player;
    }

    getActiveUsers(islandId: string) {
        const room = this.gameStorage.getIsland(islandId);
        if (!room) throw new Error('없는 방');

        const activeUsers: Player[] = [];

        room.players.forEach((playerId) => {
            const player = this.gameStorage.getPlayer(playerId);
            if (player) {
                activeUsers.push(player);
            }
        });

        return activeUsers;
    }

    kickPlayerById(playerId: string) {
        const player = this.gameStorage.getPlayerById(playerId);
        if (player) {
            this.leaveRoom(player.roomId, player.clientId);
            return player;
        }
    }

    getPlayer(playerId: string) {
        return this.gameStorage.getPlayer(playerId);
    }

    attack(attacker: Player) {
        const island = this.gameStorage.getIsland(attacker.roomId);
        if (!island || island.players.size === 0) return;

        const boxSize = ATTACK_BOX_SIZE.PAWN;
        const attackBox = {
            x: attacker.isFacingRight
                ? attacker.x + boxSize.width / 2
                : attacker.x - boxSize.width / 2,
            y: attacker.y,
            width: boxSize.width,
            height: boxSize.height,
        };

        const attackedPlayer = Array.from(island.players)
            .map((playerId) => this.getPlayer(playerId))
            .filter((player) => player !== null)
            .filter((player) => player.id !== attacker.id)
            .filter((player) => this.isInAttackBox(player, attackBox));

        return attackedPlayer;
    }

    isInAttackBox(
        player: Player,
        box: { x: number; y: number; width: number; height: number },
    ) {
        return (
            player.x >= box.x - box.width / 2 &&
            player.x <= box.x + box.width / 2 &&
            player.y >= box.y - box.height / 2 &&
            player.y <= box.y + box.height / 2
        );
    }

    loggingStore(logger: Logger) {
        logger.debug('전체 회원', this.gameStorage.getPlayerStore());
        logger.debug('전체 방', this.gameStorage.getIslandStore());
        logger.debug('타입별 방', this.gameStorage.getIslandOfTagStore());
    }
}
